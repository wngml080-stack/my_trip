/**
 * @file bookmark-api.ts
 * @description 북마크 API 함수
 *
 * Supabase를 사용하여 북마크 기능을 구현합니다.
 *
 * 주요 기능:
 * - 북마크 추가/제거
 * - 북마크 목록 조회
 * - 북마크 여부 확인
 *
 * @dependencies
 * - Supabase 클라이언트 (컴포넌트에서 전달받음)
 * - supabase/migrations/schema.sql: bookmarks 테이블
 */

import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * 북마크 추가
 */
export async function addBookmark(
  supabase: SupabaseClient,
  contentId: string,
  clerkUserId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Clerk user ID로 사용자 정보 가져오기
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkUserId)
      .single();

    if (userError || !userData) {
      return { success: false, error: "사용자 정보를 찾을 수 없습니다." };
    }

    // 북마크 추가
    const { error } = await supabase.from("bookmarks").insert({
      user_id: userData.id,
      content_id: contentId,
    });

    if (error) {
      // 중복 북마크인 경우 무시
      if (error.code === "23505") {
        return { success: true };
      }
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "북마크 추가 실패",
    };
  }
}

/**
 * 북마크 제거
 */
export async function removeBookmark(
  supabase: SupabaseClient,
  contentId: string,
  clerkUserId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Clerk user ID로 사용자 정보 가져오기
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkUserId)
      .single();

    if (userError || !userData) {
      return { success: false, error: "사용자 정보를 찾을 수 없습니다." };
    }

    // 북마크 제거
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("user_id", userData.id)
      .eq("content_id", contentId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "북마크 제거 실패",
    };
  }
}

/**
 * 북마크 여부 확인
 */
export async function isBookmarked(
  supabase: SupabaseClient,
  contentId: string,
  clerkUserId: string
): Promise<boolean> {
  try {
    // Clerk user ID로 사용자 정보 가져오기
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkUserId)
      .single();

    if (userError || !userData) {
      return false;
    }

    // 북마크 확인
    const { data, error } = await supabase
      .from("bookmarks")
      .select("id")
      .eq("user_id", userData.id)
      .eq("content_id", contentId)
      .single();

    if (error || !data) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * 북마크 목록 조회
 */
export async function getBookmarks(
  supabase: SupabaseClient,
  clerkUserId: string
): Promise<{ content_id: string; created_at: string }[]> {
  try {
    // Clerk user ID로 사용자 정보 가져오기
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkUserId)
      .single();

    if (userError || !userData) {
      return [];
    }

    // 북마크 목록 조회
    const { data, error } = await supabase
      .from("bookmarks")
      .select("content_id, created_at")
      .eq("user_id", userData.id)
      .order("created_at", { ascending: false });

    if (error || !data) {
      return [];
    }

    return data;
  } catch {
    return [];
  }
}

