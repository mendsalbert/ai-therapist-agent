"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Heart, 
  Lightbulb, 
  CheckCircle, 
  AlertCircle,
  Save,
  RotateCcw
} from "lucide-react";
import { toast } from "sonner";

interface ThoughtRecord {
  id?: string;
  situation: string;
  automaticThoughts: string;
  emotions: string[];
  emotionIntensity: number;
  evidenceFor: string;
  evidenceAgainst: string;
  balancedThought: string;
  cognitiveDistortions: string[];
  createdAt: Date;
}

const COGNITIVE_DISTORTIONS = [
  "All-or-nothing thinking",
  "Catastrophizing",
  "Mind reading",
  "Fortune telling",
  "Should statements",
  "Personalization",
  "Mental filter",
  "Disqualifying the positive",
  "Jumping to conclusions",
  "Magnification/Minimization"
];

const EMOTIONS = [
  "Anxious", "Sad", "Angry", "Frustrated", "Guilty", "Shame", "Fear", "Worry",
  "Hopeless", "Overwhelmed", "Lonely", "Rejected", "Inadequate", "Worthless"
];

export function ThoughtRecordForm() {
  const [thoughtRecord, setThoughtRecord] = useState<Partial<ThoughtRecord>>({
    situation: "",
    automaticThoughts: "",
    emotions: [],
    emotionIntensity: 5,
    evidenceFor: "",
    evidenceAgainst: "",
    balancedThought: "",
    cognitiveDistortions: [],
    createdAt: new Date()
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmotionToggle = (emotion: string) => {
    setThoughtRecord(prev => ({
      ...prev,
      emotions: prev.emotions?.includes(emotion)
        ? prev.emotions.filter(e => e !== emotion)
        : [...(prev.emotions || []), emotion]
    }));
  };

  const handleDistortionToggle = (distortion: string) => {
    setThoughtRecord(prev => ({
      ...prev,
      cognitiveDistortions: prev.cognitiveDistortions?.includes(distortion)
        ? prev.cognitiveDistortions.filter(d => d !== distortion)
        : [...(prev.cognitiveDistortions || []), distortion]
    }));
  };

  const handleSubmit = async () => {
    if (!thoughtRecord.situation || !thoughtRecord.automaticThoughts) {
      toast.error("Please fill in the situation and automatic thoughts");
      return;
    }

    setIsSubmitting(true);
    try {
      // Save thought record to backend
      const response = await fetch('/api/cbt/thought-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(thoughtRecord)
      });

      if (response.ok) {
        toast.success("Thought record saved successfully!");
        // Reset form
        setThoughtRecord({
          situation: "",
          automaticThoughts: "",
          emotions: [],
          emotionIntensity: 5,
          evidenceFor: "",
          evidenceAgainst: "",
          balancedThought: "",
          cognitiveDistortions: [],
          createdAt: new Date()
        });
        setCurrentStep(1);
      } else {
        throw new Error('Failed to save thought record');
      }
    } catch (error) {
      console.error('Error saving thought record:', error);
      toast.error("Failed to save thought record. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" />
          Thought Record Worksheet
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Step {currentStep} of 4</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4].map(step => (
              <div
                key={step}
                className={`w-2 h-2 rounded-full ${
                  step <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Step 1: Situation & Automatic Thoughts */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <Label htmlFor="situation" className="text-base font-semibold">
                What was the situation?
              </Label>
              <Textarea
                id="situation"
                placeholder="Describe what happened, where you were, who was involved..."
                value={thoughtRecord.situation || ""}
                onChange={(e) => setThoughtRecord(prev => ({ ...prev, situation: e.target.value }))}
                className="mt-2"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="automaticThoughts" className="text-base font-semibold">
                What thoughts went through your mind?
              </Label>
              <Textarea
                id="automaticThoughts"
                placeholder="What were you thinking? What did you say to yourself?"
                value={thoughtRecord.automaticThoughts || ""}
                onChange={(e) => setThoughtRecord(prev => ({ ...prev, automaticThoughts: e.target.value }))}
                className="mt-2"
                rows={3}
              />
            </div>

            <div>
              <Label className="text-base font-semibold mb-3 block">
                What emotions did you feel?
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {EMOTIONS.map(emotion => (
                  <Badge
                    key={emotion}
                    variant={thoughtRecord.emotions?.includes(emotion) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/10"
                    onClick={() => handleEmotionToggle(emotion)}
                  >
                    {emotion}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="emotionIntensity" className="text-base font-semibold">
                How intense were these emotions? (1-10)
              </Label>
              <Input
                id="emotionIntensity"
                type="range"
                min="1"
                max="10"
                value={thoughtRecord.emotionIntensity || 5}
                onChange={(e) => setThoughtRecord(prev => ({ ...prev, emotionIntensity: parseInt(e.target.value) }))}
                className="mt-2"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-1">
                <span>1 (Mild)</span>
                <span className="font-semibold">{thoughtRecord.emotionIntensity || 5}</span>
                <span>10 (Intense)</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Evidence Analysis */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <Label htmlFor="evidenceFor" className="text-base font-semibold">
                What evidence supports this thought?
              </Label>
              <Textarea
                id="evidenceFor"
                placeholder="What facts or experiences support this thought?"
                value={thoughtRecord.evidenceFor || ""}
                onChange={(e) => setThoughtRecord(prev => ({ ...prev, evidenceFor: e.target.value }))}
                className="mt-2"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="evidenceAgainst" className="text-base font-semibold">
                What evidence contradicts this thought?
              </Label>
              <Textarea
                id="evidenceAgainst"
                placeholder="What facts or experiences contradict this thought?"
                value={thoughtRecord.evidenceAgainst || ""}
                onChange={(e) => setThoughtRecord(prev => ({ ...prev, evidenceAgainst: e.target.value }))}
                className="mt-2"
                rows={3}
              />
            </div>

            <div>
              <Label className="text-base font-semibold mb-3 block">
                What cognitive distortions might be present?
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {COGNITIVE_DISTORTIONS.map(distortion => (
                  <Badge
                    key={distortion}
                    variant={thoughtRecord.cognitiveDistortions?.includes(distortion) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/10 justify-start"
                    onClick={() => handleDistortionToggle(distortion)}
                  >
                    {distortion}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Balanced Thought */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <Label htmlFor="balancedThought" className="text-base font-semibold">
                What is a more balanced, realistic thought?
              </Label>
              <Textarea
                id="balancedThought"
                placeholder="Based on the evidence, what would be a more balanced way to think about this situation?"
                value={thoughtRecord.balancedThought || ""}
                onChange={(e) => setThoughtRecord(prev => ({ ...prev, balancedThought: e.target.value }))}
                className="mt-2"
                rows={4}
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">💡 Tips for Balanced Thinking:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Consider both positive and negative evidence</li>
                <li>• Think about what you'd tell a friend in this situation</li>
                <li>• Look for alternative explanations</li>
                <li>• Consider the worst, best, and most likely outcomes</li>
              </ul>
            </div>
          </div>
        )}

        {/* Step 4: Review & Save */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">✅ Review Your Thought Record</h4>
              <p className="text-sm text-green-800">
                Take a moment to review your responses. This exercise helps you develop more balanced thinking patterns.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="font-semibold">Situation:</Label>
                <p className="text-sm text-muted-foreground mt-1">{thoughtRecord.situation}</p>
              </div>

              <div>
                <Label className="font-semibold">Automatic Thoughts:</Label>
                <p className="text-sm text-muted-foreground mt-1">{thoughtRecord.automaticThoughts}</p>
              </div>

              <div>
                <Label className="font-semibold">Emotions:</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {thoughtRecord.emotions?.map(emotion => (
                    <Badge key={emotion} variant="secondary">{emotion}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="font-semibold">Balanced Thought:</Label>
                <p className="text-sm text-muted-foreground mt-1">{thoughtRecord.balancedThought}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            Previous
          </Button>

          <div className="flex gap-2">
            {currentStep < 4 ? (
              <Button onClick={nextStep}>
                Next Step
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Thought Record
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
