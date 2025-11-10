// 동적 렌더링 강제 (인증 상태에 따라 내용이 달라지므로)
export const dynamic = 'force-dynamic';

export default function BookmarksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

