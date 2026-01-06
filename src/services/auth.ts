/**
 * 인증 및 권한 검증 서비스
 *
 * dealicious-inc 조직 멤버십을 확인하여 서비스 접근을 제어합니다.
 */

import { Octokit } from '@octokit/rest';

// 허용된 GitHub 조직 목록
const ALLOWED_ORGANIZATIONS = ['dealicious-inc'];

// 인증 상태 캐시 (토큰별로 검증 결과를 캐시)
const authCache = new Map<string, { valid: boolean; username: string; checkedAt: Date }>();

// 캐시 유효 시간 (1시간)
const CACHE_TTL_MS = 60 * 60 * 1000;

/**
 * GitHub 토큰으로 사용자 정보 조회
 */
async function getAuthenticatedUser(octokit: Octokit): Promise<{ login: string; email: string | null }> {
  const { data } = await octokit.users.getAuthenticated();
  return { login: data.login, email: data.email };
}

/**
 * 사용자가 허용된 조직의 멤버인지 확인
 */
async function checkOrganizationMembership(octokit: Octokit, org: string): Promise<boolean> {
  try {
    await octokit.orgs.getMembershipForAuthenticatedUser({ org });
    return true;
  } catch (error: any) {
    // 404: 멤버가 아님, 403: 권한 없음
    if (error.status === 404 || error.status === 403) {
      return false;
    }
    throw error;
  }
}

/**
 * 캐시된 인증 결과 확인
 */
function getCachedAuth(githubToken: string): { valid: boolean; username: string } | null {
  const cached = authCache.get(githubToken);
  if (!cached) return null;

  // 캐시 만료 확인
  const now = new Date();
  if (now.getTime() - cached.checkedAt.getTime() > CACHE_TTL_MS) {
    authCache.delete(githubToken);
    return null;
  }

  return { valid: cached.valid, username: cached.username };
}

/**
 * 인증 결과 캐시 저장
 */
function setCachedAuth(githubToken: string, valid: boolean, username: string): void {
  authCache.set(githubToken, { valid, username, checkedAt: new Date() });
}

export interface AuthResult {
  authorized: boolean;
  username?: string;
  organization?: string;
  error?: string;
}

/**
 * GitHub 조직 멤버십을 확인하여 서비스 접근 권한을 검증합니다.
 *
 * @param githubToken GitHub Personal Access Token
 * @returns 인증 결과
 */
export async function validateAccess(githubToken?: string): Promise<AuthResult> {
  // GITHUB_TOKEN이 없으면 거부
  if (!githubToken) {
    return {
      authorized: false,
      error: 'GITHUB_TOKEN이 필요합니다. dealicious-inc 조직 멤버만 Palette MCP를 사용할 수 있습니다.',
    };
  }

  // 캐시 확인
  const cached = getCachedAuth(githubToken);
  if (cached) {
    if (cached.valid) {
      return {
        authorized: true,
        username: cached.username,
        organization: ALLOWED_ORGANIZATIONS[0],
      };
    } else {
      return {
        authorized: false,
        username: cached.username,
        error: `사용자 '${cached.username}'은(는) dealicious-inc 조직 멤버가 아닙니다.`,
      };
    }
  }

  // GitHub API로 검증
  const octokit = new Octokit({ auth: githubToken });

  try {
    // 사용자 정보 조회
    const user = await getAuthenticatedUser(octokit);

    // 조직 멤버십 확인
    for (const org of ALLOWED_ORGANIZATIONS) {
      const isMember = await checkOrganizationMembership(octokit, org);

      if (isMember) {
        // 캐시 저장
        setCachedAuth(githubToken, true, user.login);

        console.error(`[Palette Auth] ✅ 인증 성공: ${user.login} (${org})`);
        return {
          authorized: true,
          username: user.login,
          organization: org,
        };
      }
    }

    // 어떤 조직에도 속하지 않음
    setCachedAuth(githubToken, false, user.login);

    console.error(`[Palette Auth] ❌ 인증 실패: ${user.login} - 허용된 조직 멤버 아님`);
    return {
      authorized: false,
      username: user.login,
      error: `사용자 '${user.login}'은(는) dealicious-inc 조직 멤버가 아닙니다. 조직 관리자에게 문의하세요.`,
    };
  } catch (error: any) {
    // 토큰 유효성 검사 실패
    if (error.status === 401) {
      return {
        authorized: false,
        error: 'GITHUB_TOKEN이 유효하지 않습니다. 토큰을 확인해주세요.',
      };
    }

    // 기타 오류
    console.error('[Palette Auth] 인증 중 오류 발생:', error.message);
    return {
      authorized: false,
      error: `인증 중 오류가 발생했습니다: ${error.message}`,
    };
  }
}

/**
 * 인증 캐시 초기화 (테스트용)
 */
export function clearAuthCache(): void {
  authCache.clear();
}
