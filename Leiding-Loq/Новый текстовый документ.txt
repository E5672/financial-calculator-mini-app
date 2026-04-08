"use client";

import React from "react";
import { motion } from "framer-motion";

const words = ["Считай", "Решай", "Едь"];
const stats = [
  { value: "–30%", label: "затрат" },
  { value: "x3", label: "скорость" },
  { value: "–50%", label: "нагрузки" },
  { value: "24/7", label: "решения за секунды" },
];

const problems = [
  "перегруженные логисты",
  "решения принимаются долго",
  "ошибки в рейсах",
  "хаос в процессах",
];

const solution = [
  "считает рентабельность рейса",
  "учитывает ограничения и параметры",
  "подбирает транспорт под задачу",
  "контролирует критичные этапы процесса",
];

export default function Landing() {
  return (
    <main className="bg-[#050816] text-white selection:bg-green-400/30 selection:text-white">
      <section className="relative min-h-screen overflow-hidden border-b border-white/10">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover opacity-50"
        >
          <source src="/video.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_28%),linear-gradient(180deg,rgba(5,8,22,0.18),rgba(5,8,22,0.72),rgba(5,8,22,0.96))]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:80px_80px] opacity-[0.08]" />

        <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl grid-cols-1 items-center gap-12 px-6 py-16 md:px-10 lg:grid-cols-2 lg:px-16">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-gray-200 backdrop-blur-md"
            >
              <span className="text-green-400">●</span>
              расчёт за 3 секунды
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="mb-5 text-5xl font-semibold leading-[0.95] tracking-tight md:text-6xl lg:text-7xl"
            >
              Цифровая логика рейса
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-8 max-w-2xl text-lg text-gray-300 md:text-xl"
            >
              Логистика в цифре. Решения за секунды, а не часы.
            </motion.p>

            <div className="mb-8 space-y-1 text-3xl font-medium leading-tight md:text-4xl lg:text-5xl">
              {words.map((word, index) => (
                <motion.div
                  key={word}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.35 + index * 0.18 }}
                  className="drop-shadow-[0_0_18px_rgba(74,222,128,0.12)]"
                >
                  {word}
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex flex-wrap gap-4"
            >
              <button className="rounded-2xl bg-green-500 px-6 py-3 shadow-[0_0_30px_rgba(34,197,94,0.25)] transition hover:bg-green-400">
                Рассчитать рейс
              </button>
              <button className="rounded-2xl border border-white/25 bg-white/5 px-6 py-3 backdrop-blur-md transition hover:bg-white hover:text-black">
                Пройти анкету
              </button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.25 }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="relative h-[420px] w-[300px] overflow-hidden rounded-[32px] border border-white/15 bg-white/10 shadow-2xl backdrop-blur-xl md:h-[500px] md:w-[360px]">
              <img
                src="/founder-photo.jpg"
                alt="Елена Жилина"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="mb-1 text-2xl font-semibold">Елена Жилина</div>
                <div className="mb-3 text-sm text-gray-300">
                  Автор продукта · Оптимизация логистики · AI-архитектура процессов
                </div>
                <div className="inline-flex items-center rounded-full border border-white/15 bg-black/30 px-3 py-1 text-xs text-gray-200 backdrop-blur-md">
                  10+ лет в логистике
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 md:px-10 lg:px-16">
        <div className="max-w-3xl">
          <div className="mb-4 text-sm uppercase tracking-[0.24em] text-green-400/80">
            Блок 2
          </div>
          <h2 className="mb-6 text-3xl font-semibold tracking-tight md:text-5xl">
            Логистика больше не интуиция
          </h2>
          <div className="space-y-4 text-lg leading-relaxed text-gray-300 md:text-xl">
            <p>Рейсы до сих пор берут “на глаз”.</p>
            <p>Прибыль считают потом. Ошибки стоят дорого.</p>
            <p className="text-white">Мы переворачиваем это.</p>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-white/10 px-6 md:grid-cols-4 md:px-10 lg:px-16">
          {stats.map((item) => (
            <div key={item.label} className="bg-[#050816] px-6 py-10 md:px-8 md:py-14">
              <div className="mb-2 text-4xl font-semibold tracking-tight md:text-5xl">
                {item.value}
              </div>
              <div className="text-sm uppercase tracking-[0.18em] text-gray-400">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-24 md:px-10 lg:grid-cols-2 lg:px-16">
        <div>
          <div className="mb-4 text-sm uppercase tracking-[0.24em] text-green-400/80">
            Блок 4
          </div>
          <h2 className="mb-4 text-3xl font-semibold tracking-tight md:text-5xl">
            Это не калькулятор
            <br />
            Это система принятия решений
          </h2>
          <p className="max-w-2xl text-lg leading-relaxed text-gray-300">
            Продукт считает рентабельность, учитывает ограничения и помогает управлять
            процессом до того, как ошибка стала убытком.
          </p>
        </div>

        <div className="grid gap-4">
          {solution.map((item) => (
            <div
              key={item}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm"
            >
              <div className="flex items-start gap-3">
                <span className="mt-1 text-green-400">●</span>
                <p className="text-base text-gray-200 md:text-lg">{item}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.03))]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-24 md:px-10 lg:grid-cols-2 lg:px-16">
          <div>
            <div className="mb-4 text-sm uppercase tracking-[0.24em] text-green-400/80">
              Блок 5
            </div>
            <h2 className="mb-5 text-3xl font-semibold tracking-tight md:text-5xl">
              Попробуй на реальном рейсе
            </h2>
            <p className="max-w-xl text-lg leading-relaxed text-gray-300">
              Минимальный демо-калькулятор показывает ценность продукта за несколько секунд.
            </p>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-black/30 p-6 shadow-2xl backdrop-blur-xl md:p-8">
            <div className="grid gap-4">
              <input
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-gray-500"
                placeholder="Откуда → Куда"
              />
              <input
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-gray-500"
                placeholder="Ставка"
              />
              <input
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-gray-500"
                placeholder="Тип машины"
              />
              <button className="mt-2 rounded-2xl bg-green-500 px-6 py-3 font-medium text-black transition hover:bg-green-400">
                Рассчитать
              </button>
            </div>

            <div className="mt-6 rounded-3xl border border-green-400/20 bg-green-400/5 p-5">
              <div className="mb-2 text-sm uppercase tracking-[0.18em] text-green-300">
                Результат
              </div>
              <div className="space-y-2 text-gray-200">
                <div>Прибыль: +18 400 ₽</div>
                <div>Время: 1.5 дня</div>
                <div>Риск: средний</div>
              </div>
              <div className="mt-5 border-t border-white/10 pt-4">
                <div className="mb-3 text-sm text-gray-300">Хочешь точнее?</div>
                <button className="rounded-2xl border border-white/20 bg-white/5 px-5 py-3 transition hover:bg-white hover:text-black">
                  Пройти анкету
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 md:px-10 lg:px-16">
        <div className="mb-8 max-w-3xl">
          <div className="mb-4 text-sm uppercase tracking-[0.24em] text-green-400/80">
            Блок 6–7
          </div>
          <h2 className="mb-5 text-3xl font-semibold tracking-tight md:text-5xl">
            Узкие места логистики видны только в цифре
          </h2>
          <p className="text-lg leading-relaxed text-gray-300">
            Оставляем анкету как основной путь в воронке, но внутри даём быстрый переход к
            мгновенному расчёту.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {problems.map((item) => (
            <div
              key={item}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-lg text-gray-200"
            >
              — {item}
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm md:p-8">
          <div className="mb-3 text-lg font-medium">Нужно быстрее?</div>
          <button className="rounded-2xl bg-green-500 px-5 py-3 text-black transition hover:bg-green-400">
            Рассчитать сейчас
          </button>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-24 md:px-10 lg:grid-cols-2 lg:px-16">
          <div>
            <div className="mb-4 text-sm uppercase tracking-[0.24em] text-green-400/80">
              Блок 8
            </div>
            <h2 className="mb-5 text-3xl font-semibold tracking-tight md:text-5xl">
              Система принимает решения за секунды
            </h2>
          </div>

          <div className="space-y-4 text-lg text-gray-300">
            <p>считает рейсы</p>
            <p>подбирает транспорт</p>
            <p>контролирует процессы</p>
            <p>убирает человеческий фактор</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 md:px-10 lg:px-16">
        <div className="rounded-[40px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_26%),rgba(255,255,255,0.03)] p-8 md:p-12">
          <div className="mb-4 text-sm uppercase tracking-[0.24em] text-green-400/80">
            Блок 9
          </div>
          <h2 className="mb-6 max-w-4xl text-3xl font-semibold tracking-tight md:text-5xl">
            Логистика не должна зависеть от людей.
            <br className="hidden md:block" />
            Она должна работать как система.
          </h2>
          <p className="mb-8 max-w-2xl text-lg leading-relaxed text-gray-300">
            Это уже не сервис “про помощь логисту”. Это новая модель принятия решений,
            которую можно масштабировать в продукт, SaaS и полноценную операционную систему.
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="rounded-2xl bg-green-500 px-6 py-3 text-black transition hover:bg-green-400">
              Рассчитать рейс
            </button>
            <button className="rounded-2xl border border-white/20 bg-white/5 px-6 py-3 transition hover:bg-white hover:text-black">
              Пройти анкету
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
