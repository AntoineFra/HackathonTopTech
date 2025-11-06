"use client";

import { AIResponse } from "@/types";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { IndicatorList } from "./indicator-card";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

interface AIResponseDisplayProps {
    response: AIResponse;
}

export function AIResponseDisplay({ response }: AIResponseDisplayProps) {
    const confidenceColor =
        response.confidence >= 0.8
            ? "text-green-600"
            : response.confidence >= 0.6
              ? "text-yellow-600"
              : "text-red-600";

    const confidenceIcon =
        response.confidence >= 0.8
            ? CheckCircle2
            : response.confidence >= 0.6
              ? Info
              : AlertCircle;

    const ConfidenceIcon = confidenceIcon;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <CardTitle>Réponse</CardTitle>
                        <div className="flex items-center gap-2">
                            <ConfidenceIcon
                                className={`h-4 w-4 ${confidenceColor}`}
                            />
                            <Badge
                                variant="outline"
                                className={confidenceColor}
                            >
                                {Math.round(response.confidence * 100)}% de
                                confiance
                            </Badge>
                        </div>
                    </div>
                    <CardDescription>
                        Question : &quot;{response.query}&quot;
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-base leading-relaxed whitespace-pre-wrap">
                        {response.answer}
                    </p>
                </CardContent>
            </Card>

            {response.limitations && (
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        <strong>Limitations :</strong> {response.limitations}
                    </AlertDescription>
                </Alert>
            )}

            {response.indicators && response.indicators.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">
                        Indicateurs associés
                    </h3>
                    <IndicatorList indicators={response.indicators} />
                </div>
            )}

            {response.sources && response.sources.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Sources</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
                            {response.sources.map((source, index) => (
                                <li key={index}>{source}</li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
