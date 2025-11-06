"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone, Send, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate form submission
        await new Promise((resolve) => setTimeout(resolve, 1500));

        setIsSubmitting(false);
        setSubmitted(true);

        // Reset form after 3 seconds
        setTimeout(() => {
            setFormData({ name: "", email: "", subject: "", message: "" });
            setSubmitted(false);
        }, 3000);
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="mx-auto max-w-6xl px-4 py-12">
            {/* Header */}
            <div className="mb-12 text-center">
                <h1 className="text-foreground mb-4 text-4xl font-bold">
                    Contactez-nous
                </h1>
                <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
                    Vous avez des questions sur O6 Analytics ? Notre équipe est
                    là pour vous aider.
                </p>
                <p className="text-muted-foreground text-sm">
                    Nous nous efforçons de répondre à toutes les demandes dans
                    un délai de 24 heures ouvrables.
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
                {/* Contact Info Cards */}
                <div className="space-y-6 md:col-span-1">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                                <div className="bg-primary/10 text-primary rounded-lg p-3">
                                    <Mail className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-foreground mb-1 font-semibold">
                                        Email
                                    </h3>
                                    <a
                                        href="mailto:contact@06-analytics.fr"
                                        className="text-muted-foreground hover:text-primary text-sm transition-colors"
                                    >
                                        contact@06-analytics.fr
                                    </a>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                                <div className="bg-primary/10 text-primary rounded-lg p-3">
                                    <Phone className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-foreground mb-1 font-semibold">
                                        Téléphone
                                    </h3>
                                    <a
                                        href="tel:+33123456789"
                                        className="text-muted-foreground hover:text-primary text-sm transition-colors"
                                    >
                                        +33 1 23 45 67 89
                                    </a>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                                <div className="bg-primary/10 text-primary rounded-lg p-3">
                                    <MapPin className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-foreground mb-1 font-semibold">
                                        Adresse
                                    </h3>
                                    <p className="text-muted-foreground text-sm">
                                        123 Avenue des Alpes
                                        <br />
                                        06000 Nice, France
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Contact Form */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Envoyez-nous un message</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label
                                        htmlFor="name"
                                        className="text-foreground text-sm font-medium"
                                    >
                                        Nom complet
                                    </label>
                                    <Input
                                        id="name"
                                        name="name"
                                        type="text"
                                        placeholder="Jean Dupont"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        disabled={isSubmitting || submitted}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label
                                        htmlFor="email"
                                        className="text-foreground text-sm font-medium"
                                    >
                                        Email
                                    </label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="jean.dupont@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        disabled={isSubmitting || submitted}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label
                                    htmlFor="subject"
                                    className="text-foreground text-sm font-medium"
                                >
                                    Sujet
                                </label>
                                <Input
                                    id="subject"
                                    name="subject"
                                    type="text"
                                    placeholder="Comment puis-je vous aider ?"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                    disabled={isSubmitting || submitted}
                                />
                            </div>

                            <div className="space-y-2">
                                <label
                                    htmlFor="message"
                                    className="text-foreground text-sm font-medium"
                                >
                                    Message
                                </label>
                                <Textarea
                                    id="message"
                                    name="message"
                                    placeholder="Écrivez votre message ici..."
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    disabled={isSubmitting || submitted}
                                    rows={6}
                                    className="resize-none"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full gap-2"
                                disabled={isSubmitting || submitted}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Envoi en cours...
                                    </>
                                ) : submitted ? (
                                    <>✓ Message envoyé !</>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4" />
                                        Envoyer le message
                                    </>
                                )}
                            </Button>

                            {submitted && (
                                <div className="bg-primary/10 border-primary/20 text-primary rounded-lg border p-4 text-center text-sm">
                                    Merci pour votre message ! Nous vous
                                    répondrons dans les plus brefs délais.
                                </div>
                            )}
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
