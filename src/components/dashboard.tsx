"use client";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Target,
  Check,
  Clock3,
  Layers3,
  MoveUpRight,
} from "lucide-react";
import { useProgress } from "./progress-provider";
import {
  dueReviews,
  mastery,
  wrongAnswers,
  isComplete,
  recommendPractice,
} from "@/modules/progress";
import { curriculum } from "@/data/curriculum";
import { lesson } from "@/data/content";
export function Dashboard() {
  const { state } = useProgress();
  const attempts = state?.attempts ?? [];
  const skills = curriculum.units[0].concepts;
  const mean = Math.round(
      skills.reduce((n, c) => n + mastery(attempts, c.id), 0) / skills.length,
    ),
    due = dueReviews(attempts),
    wrong = wrongAnswers(attempts),
    done = state
      ? isComplete(
          state,
          curriculum.units[0],
          lesson.blocks.map((b) => b.id),
        )
      : false;
  const recommendation = recommendPractice(
    attempts,
    skills.map((c) => c.id),
  );
  return (
    <div className="page dashboard">
      <div className="page-heading">
        <div>
          <div className="eyebrow">YOUR MATH JOURNEY</div>
          <h1>
            오늘도, 한 개념 더 단단하게<span className="heading-dot">.</span>
          </h1>
          <p>어디서 시작하든 괜찮아요. 작은 이해가 큰 변화를 만듭니다.</p>
        </div>
        <span className="quiet-badge">
          <span />
          기초부터 차근차근
        </span>
      </div>
      <div className="dashboard-grid">
        <section className="hero-card">
          <div className="hero-copy">
            <span className="light-label">
              <span /> 오늘의 추천 학습
            </span>
            <div className="unit-tag">
              LEVEL 0 <span>·</span> M0-01
            </div>
            <h2>
              수학의 첫걸음,
              <br />
              자연수와 자리값
            </h2>
            <p>
              숫자의 위치가 바뀌면 값도 달라져요.
              <br />
              직접 움직이며 수의 구조를 발견해 보세요.
            </p>
            <Link className="button white" href="/learn/M0-01">
              {attempts.length ? "이어서 학습하기" : "첫 학습 시작하기"}{" "}
              <ArrowRight size={18} />
            </Link>
            <span className="hero-duration">
              <Clock3 size={14} /> 예상 학습 20분 · 개념 + 실험 + 연습
            </span>
          </div>
          <div className="place-art" aria-hidden="true">
            <div className="art-orbit orbit-one" />
            <div className="art-orbit orbit-two" />
            <div className="art-label">자리가 만드는 가능성</div>
            <div className="number-tiles">
              {["1", "0", "2", "4"].map((n, i) => (
                <div className={`number-tile tile-${i}`} key={i}>
                  <span>{n}</span>
                  <small>{["천", "백", "십", "일"][i]}의 자리</small>
                </div>
              ))}
            </div>
            <div className="art-equation">
              1,000 <b>+</b> 0 <b>+</b> 20 <b>+</b> 4
            </div>
            <span className="art-plus plus-one">+</span>
            <span className="art-plus plus-two">+</span>
          </div>
        </section>
        <section className="journey-card card">
          <div className="section-top">
            <h2>나의 출발점</h2>
            <span className="soft-tag">LEVEL 0</span>
          </div>
          <div className="journey-icon">
            <Layers3 size={26} />
          </div>
          <h3>수학의 언어 익히기</h3>
          <p>서두르지 말고, 기초부터 탄탄하게.</p>
          <div className="progress-label">
            <span>현재 단원 숙달도</span>
            <strong>
              {mean}
              <small>%</small>
            </strong>
          </div>
          <div
            className="progress-track"
            role="progressbar"
            aria-label="현재 단원 숙달도"
            aria-valuenow={mean}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span style={{ width: `${mean}%` }} />
          </div>
          <div className="journey-bottom">
            <span>
              <b>{done ? 1 : 0}</b> / 1 공개 단원 완료
            </span>
            <Link href="/curriculum" aria-label="커리큘럼으로 이동">
              <ArrowUpRight size={19} />
            </Link>
          </div>
        </section>
      </div>
      <section className="stats-grid" aria-label="학습 요약">
        {[
          {
            icon: BookOpen,
            label: "지금까지 푼 문제",
            value: attempts.length,
            unit: "회",
            note: "힌트와 재시도도 함께 기록",
          },
          {
            icon: Target,
            label: "현재 개념 숙달도",
            value: mean,
            unit: "%",
            note: "독립 정답을 기준으로 계산",
          },
          {
            icon: RotateIcon,
            label: "오늘 복습할 문제",
            value: due.length,
            unit: "개",
            note: "하루 뒤, 한 번 더 기억하기",
          },
          {
            icon: Check,
            label: "교정이 필요한 오답",
            value: wrong.length,
            unit: "개",
            note: "실수를 이해로 바꾸는 시간",
          },
        ].map(({ icon: Icon, label, value, unit, note }) => (
          <div className="stat-card card" key={label}>
            <div className="stat-label">
              <span>{label}</span>
              <Icon size={18} />
            </div>
            <div className="stat-number">
              {value}
              <span>{unit}</span>
            </div>
            <p>{note}</p>
          </div>
        ))}
      </section>
      <div className="lower-grid">
        <section className="card path-card">
          <div className="section-top">
            <h2>한 걸음씩, 나의 학습 경로</h2>
            <Link href="/curriculum">
              커리큘럼 보기 <ArrowRight size={15} />
            </Link>
          </div>
          <div className="path-row">
            {[
              {
                n: "01",
                title: "개념 이해",
                desc: "수의 구조 발견하기",
                icon: BookOpen,
              },
              {
                n: "02",
                title: "직접 실험",
                desc: "움직이며 확인하기",
                icon: Layers3,
              },
              {
                n: "03",
                title: "스스로 풀이",
                desc: "세 가지 유형 만나기",
                icon: Target,
              },
              {
                n: "04",
                title: "확인과 복습",
                desc: "기억을 내 것으로",
                icon: Check,
              },
            ].map(({ n, title, desc, icon: Icon }, i) => (
              <div className={`path-step ${i === 0 ? "current" : ""}`} key={n}>
                <span className="step-icon">
                  <Icon size={20} />
                </span>
                <span className="step-number">STEP {n}</span>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="card next-card">
          <span className="eyebrow">A LITTLE, EVERY DAY</span>
          <h2>오늘의 작은 목표</h2>
          <p>
            {skills.find((c) => c.id === recommendation.skillId)?.label}{" "}
            개념부터
            <br />
            나의 말로 설명해 볼까요?
          </p>
          <Link href="/learn/M0-01">
            <span>자리표로 이해하러 가기</span>
            <span className="round-arrow">
              <MoveUpRight size={19} />
            </span>
          </Link>
        </section>
      </div>
      <div className="scope-note">
        <span className="soft-tag">공개 범위</span> 전체 170단원을 목표로 설계
        중입니다. 지금은 M0-01 한 단원을 학습할 수 있어요.
      </div>
    </div>
  );
}
function RotateIcon(props: { size: number }) {
  return <Clock3 {...props} />;
}
