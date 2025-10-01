import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, AlertCircle, CheckCircle, Sparkles, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function AIInsights() {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<any>(null);
  const { toast } = useToast();

  const generateInsights = async () => {
    setLoading(true);
    try {
      const patientData = {
        medications: [
          { name: "Lisinopril", adherence: 95, daysRemaining: 25 },
          { name: "Metformin", adherence: 98, daysRemaining: 30 },
          { name: "Aspirin", adherence: 100, daysRemaining: 28 }
        ],
        vitals: {
          heartRate: 72,
          bloodPressure: "125/82",
          weight: 68,
          trend: "stable"
        },
        appointments: {
          upcoming: 1,
          missedLastYear: 0,
          completionRate: 100
        },
        conditions: ["Hypertension", "Type 2 Diabetes", "Arthritis"]
      };

      const { data, error } = await supabase.functions.invoke('ai-health-insights', {
        body: { patientData }
      });

      if (error) throw error;

      setInsights(data);
      toast({
        title: "AI Insights Generated",
        description: "Health analysis completed successfully",
      });
    } catch (error) {
      console.error('Error generating insights:', error);
      toast({
        title: "Error",
        description: "Failed to generate insights",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const mockInsights = {
    overallHealth: {
      score: 85,
      status: "Good",
      trend: "improving"
    },
    recommendations: [
      {
        category: "Medication Adherence",
        priority: "high",
        title: "Excellent Medication Compliance",
        description: "Patient shows outstanding adherence to prescribed medications with 97% average compliance rate.",
        action: "Continue current routine"
      },
      {
        category: "Vital Signs",
        priority: "medium",
        title: "Blood Pressure Monitoring",
        description: "Blood pressure readings are slightly elevated. Consider more frequent monitoring.",
        action: "Schedule follow-up with cardiologist"
      },
      {
        category: "Lifestyle",
        priority: "low",
        title: "Physical Activity",
        description: "Based on vitals trend, consider incorporating light daily exercise routine.",
        action: "Discuss exercise plan with healthcare provider"
      }
    ],
    alerts: [
      {
        type: "refill",
        message: "Lisinopril requires refill within 2 weeks",
        severity: "medium"
      }
    ],
    predictions: {
      medicationRefillDate: "2025-10-15",
      nextHealthReview: "2025-10-20",
      riskFactors: ["Hypertension management", "Blood sugar monitoring"]
    }
  };

  const displayInsights = insights || mockInsights;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Brain className="w-7 h-7 text-primary" />
            AI Health Insights
          </h1>
          <p className="text-sm text-muted-foreground">Personalized health analysis powered by AI</p>
        </div>
        <Button onClick={generateInsights} disabled={loading} className="gap-2">
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {loading ? "Analyzing..." : "Generate Insights"}
        </Button>
      </div>

      <Card className="shadow-elevated border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Overall Health Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="text-6xl font-bold text-primary">{displayInsights.overallHealth.score}</div>
            <div>
              <Badge variant="default" className="mb-2">{displayInsights.overallHealth.status}</Badge>
              <p className="text-sm text-muted-foreground">
                Health trend: <span className="font-medium text-primary">{displayInsights.overallHealth.trend}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold mb-4">Personalized Recommendations</h2>
        <div className="space-y-4">
          {displayInsights.recommendations.map((rec: any, index: number) => (
            <Card key={index} className="shadow-card hover-scale">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    rec.priority === "high" ? "bg-primary/10 text-primary" :
                    rec.priority === "medium" ? "bg-secondary/10 text-secondary" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{rec.title}</h3>
                      <Badge variant={rec.priority === "high" ? "default" : "secondary"}>
                        {rec.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Recommended Action:</span>
                      <span className="text-primary">{rec.action}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {displayInsights.alerts.map((alert: any, index: number) => (
              <div key={index} className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                <p className="text-sm font-medium">{alert.message}</p>
                <Badge variant="outline" className="mt-2">{alert.severity}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              AI Predictions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Next Medication Refill</p>
              <p className="font-semibold">{displayInsights.predictions.medicationRefillDate}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Recommended Health Review</p>
              <p className="font-semibold">{displayInsights.predictions.nextHealthReview}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Risk Factors to Monitor</p>
              <div className="flex flex-wrap gap-2">
                {displayInsights.predictions.riskFactors.map((risk: string, index: number) => (
                  <Badge key={index} variant="secondary">{risk}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}