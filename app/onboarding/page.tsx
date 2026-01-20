"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, HeartPulse, Moon, Smile, Sparkles } from "lucide-react";
import { toast } from "sonner";

type GoalKey = "stress" | "sleep" | "focus";

const GOAL_OPTIONS: Record<
  GoalKey,
  { title: string; desc: string; icon: JSX.Element; color: string }
> = {
  stress: {
    title: "Reduce Stress & Anxiety",
    desc: "Quick grounding, CBT reframes, and gentle AI check-ins.",
    icon: <HeartPulse className="h-5 w-5" />,
    color: "bg-rose-50 text-rose-700 border-rose-100",
  },
  sleep: {
    title: "Improve Sleep",
    desc: "Wind-down meditations, evening journaling, and consistent bedtime nudges.",
    icon: <Moon className="h-5 w-5" />,
    color: "bg-indigo-50 text-indigo-700 border-indigo-100",
  },
  focus: {
    title: "Build Focus & Mood",
    desc: "Morning mood checks, micro-goals, and short meditations to start strong.",
    icon: <Sparkles className="h-5 w-5" />,
    color: "bg-amber-50 text-amber-700 border-amber-100",
  },
};

const PLAN_TEMPLATES: Record<GoalKey, Array<{ day: string; action: string; time: string }>> = {
  stress: [
    { day: "Day 1", action: "2-min grounding + mood check", time: "morning" },
    { day: "Day 2", action: "CBT reframe: one sticky thought", time: "afternoon" },
    { day: "Day 3", action: "5-min breathing meditation", time: "evening" },
    { day: "Day 4", action: "AI chat: quick de-stress prompt", time: "whenever needed" },
    { day: "Day 5", action: "Gratitude journaling (3 lines)", time: "evening" },
    { day: "Day 6", action: "Revisit stress triggers & wins", time: "afternoon" },
    { day: "Day 7", action: "Weekly recap + 2 gentle goals", time: "evening" },
  ],
  sleep: [
    { day: "Day 1", action: "Wind-down mood check + 3 wins", time: "evening" },
    { day: "Day 2", action: "5-min body scan meditation", time: "bedtime" },
    { day: "Day 3", action: "Jot worries -> park for tomorrow", time: "evening" },
    { day: "Day 4", action: "Dim lights + calm audio", time: "30m before bed" },
    { day: "Day 5", action: "No screens 20m before bed", time: "evening" },
    { day: "Day 6", action: "Gentle stretch + breath", time: "bedtime" },
    { day: "Day 7", action: "Sleep recap + small tweak", time: "evening" },
  ],
  focus: [
    { day: "Day 1", action: "Mood check + 1 MIT (most important task)", time: "morning" },
    { day: "Day 2", action: "5-min focus meditation", time: "morning" },
    { day: "Day 3", action: "Micro-journal: blockers & plan", time: "midday" },
    { day: "Day 4", action: "AI chat: plan next 4 hours", time: "morning" },
    { day: "Day 5", action: "Walk break + re-check mood", time: "afternoon" },
    { day: "Day 6", action: "Quick recap + adjust goals", time: "evening" },
    { day: "Day 7", action: "Weekly review: wins & next 3 goals", time: "evening" },
  ],
};

export default function OnboardingPlanPage() {
  const [selected, setSelected] = useState<GoalKey>("stress");
  const [reminderSet, setReminderSet] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("hope_reminder_opt_in") === "true";
  });

  const plan = useMemo(() => PLAN_TEMPLATES[selected], [selected]);

  const handleReminder = () => {
    if (typeof window === "undefined") return;
    const now = new Date().toISOString();
    localStorage.setItem("hope_reminder_opt_in", "true");
    localStorage.setItem("hope_plan_last_reminder", now);
    setReminderSet(true);
    toast.success("Daily reminders enabled. We’ll nudge you gently each day.");
  };

  const handleStartPlan = () => {
    if (typeof window !== "undefined") {
      const now = new Date().toISOString();
      localStorage.setItem("hope_plan_active", "true");
      localStorage.setItem("hope_plan_goal", selected);
      localStorage.setItem("hope_plan_started_at", now);
      localStorage.setItem("hope_plan_last_reminder", now);
      localStorage.setItem("hope_plan_steps", JSON.stringify(plan));
    }
    const firstStep = plan?.[0]?.action;
    toast.success(firstStep ? `Plan started. Today: ${firstStep}` : "Plan started! You can follow one small action each day.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 py-10">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pick your focus for the next 7 days</h1>
            <p className="text-muted-foreground mt-2">
              Choose a goal and we’ll lay out a simple, low-friction plan with one small action each day.
            </p>
          </div>
          <Badge variant="outline" className="gap-2 text-sm">
            <Clock className="h-4 w-4" />
            Under 5 minutes per day
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-8">
          {(Object.keys(GOAL_OPTIONS) as GoalKey[]).map((key) => {
            const option = GOAL_OPTIONS[key];
            const isActive = selected === key;
            return (
              <Card
                key={key}
                className={`cursor-pointer transition-all border-2 ${
                  isActive ? "border-primary shadow-lg" : "border-border"
                }`}
                onClick={() => setSelected(key)}
              >
                <CardHeader>
                  <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm border ${option.color}`}>
                    {option.icon}
                    <span>{option.title}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">{option.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="shadow-lg border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold">Your 7-day plan</CardTitle>
              <p className="text-muted-foreground text-sm">
                One small action per day. You can start anytime—keep it light and doable.
              </p>
            </div>
            <Badge className="gap-2" variant="secondary">
              <Smile className="h-4 w-4" />
              Personalized for {GOAL_OPTIONS[selected].title}
            </Badge>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {plan.map((item) => (
              <div key={item.day} className="flex items-start gap-3 rounded-xl border p-4 bg-card">
                <CheckCircle2 className="h-5 w-5 text-primary mt-1" />
                <div>
                  <div className="font-semibold">{item.day}</div>
                  <div className="text-sm text-muted-foreground">{item.action}</div>
                  <div className="text-xs text-muted-foreground mt-1">Suggested: {item.time}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            Tip: Pair each day’s action with a reminder or a calendar nudge.
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReminder} disabled={reminderSet}>
              {reminderSet ? "Reminders on" : "Remind me daily"}
            </Button>
            <Button onClick={handleStartPlan}>Start this plan</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
