import Link from "next/link";
export default function NotFound() {
  return (
    <div className="page empty-state">
      <h1>아직 열리지 않은 학습 공간이에요</h1>
      <p>현재 M0-01 자연수와 자리값을 학습할 수 있어요.</p>
      <Link className="button" href="/curriculum">
        커리큘럼 보기
      </Link>
    </div>
  );
}
