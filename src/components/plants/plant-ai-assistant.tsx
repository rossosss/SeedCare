"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";

type PlantAiAssistantProps = {
  plantId: string;
};

const quickQuestions = [
  "Почему нет всходов?",
  "Как понять, что пора поливать?",
  "Когда снять плёнку?",
  "Почему ростки вытянулись?"
];

export function PlantAiAssistant({ plantId }: PlantAiAssistantProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [paywall, setPaywall] = useState("");
  const [remainingRequests, setRemainingRequests] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function askAssistant(nextQuestion: string) {
    const trimmedQuestion = nextQuestion.trim();

    if (!trimmedQuestion) {
      setError("Напишите вопрос или выберите быстрый вопрос.");
      setPaywall("");
      return;
    }

    setError("");
    setPaywall("");
    setIsLoading(true);

    const response = await fetch("/api/ai/plant-advice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userPlantId: plantId,
        question: trimmedQuestion
      })
    });

    const data = (await response.json().catch(() => ({}))) as {
      answer?: string;
      error?: string;
      paywall?: string;
      code?: string;
      remainingRequests?: number | null;
    };

    if (!response.ok || !data.answer) {
      if (response.status === 402 || data.code === "AI_LIMIT_REACHED") {
        setPaywall(data.paywall ?? data.error ?? "Лимит помощника закончился. Перейдите на Plus.");
      } else {
        setError(data.error ?? "Помощник не ответил. Попробуйте ещё раз.");
      }
      setIsLoading(false);
      return;
    }

    setAnswer(data.answer);
    setRemainingRequests(typeof data.remainingRequests === "number" ? data.remainingRequests : null);
    setQuestion(trimmedQuestion);
    setIsLoading(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await askAssistant(question);
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-leaf-700">Спросить помощника</h2>
        <p className="mt-2 text-stone-600">
          Помощник учитывает растение, этап, условия, задачи и дневник. Он не заменяет план ухода,
          а объясняет простыми словами.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {quickQuestions.map((quickQuestion) => (
          <button
            key={quickQuestion}
            type="button"
            disabled={isLoading}
            className="rounded-md bg-leaf-50 px-4 py-2 text-sm font-semibold text-leaf-700 ring-1 ring-leaf-100 transition hover:ring-leaf-500 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => askAssistant(quickQuestion)}
          >
            {quickQuestion}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block">
          <span className="text-sm font-semibold text-stone-700">Ваш вопрос</span>
          <textarea
            className="mt-2 min-h-28 w-full rounded-md border border-leaf-100 bg-white px-4 py-3 text-base outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-100"
            placeholder="Например: почему базилик не всходит уже неделю?"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
          />
        </label>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Думаю..." : "Спросить"}
        </Button>
      </form>

      {paywall ? (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-5">
          <h3 className="text-lg font-bold text-yellow-950">Нужен тариф Plus</h3>
          <p className="mt-2 text-base leading-7 text-yellow-900">{paywall}</p>
          <Button href="/pricing" className="mt-4">
            Посмотреть тарифы
          </Button>
        </div>
      ) : null}

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {answer ? (
        <div className="rounded-lg bg-leaf-50 p-5">
          <p className="whitespace-pre-line text-base leading-7 text-stone-700">{answer}</p>
          {remainingRequests !== null ? (
            <p className="mt-4 text-sm font-semibold text-stone-500">
              Осталось AI-запросов в этом месяце: {remainingRequests}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
