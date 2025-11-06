import Link from "next/link";
import { LucideArrowLeft, Shield, Eye, Lock, Database } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function PrivacyPage() {
    return (
        <>
            <header className="bg-background dark:bg-card sticky top-6 left-6 z-60 mt-6 ml-6 flex h-[var(--header-height)] w-fit items-center rounded-2xl border backdrop-blur-md">
                <div className="mr-auto flex h-full items-center gap-4 px-4 py-2">
                    <div className="flex flex-1 items-center gap-3">
                        <Link
                            href="/"
                            className="text-foreground inline-flex items-center gap-2 text-base font-semibold"
                            aria-label="Retour à l'accueil"
                        >
                            <LucideArrowLeft className="h-5 w-5" />
                        </Link>
                    </div>
                    <ThemeToggle />
                </div>
            </header>

            <div className="mx-auto max-w-4xl px-6 py-12">
                <div className="mb-8">
                    <div className="mb-4 flex items-center gap-3">
                        <Shield className="text-primary h-10 w-10" />
                        <h1 className="text-4xl font-bold">
                            Politique de Confidentialité
                        </h1>
                    </div>
                    <p className="text-muted-foreground">
                        Dernière mise à jour :{" "}
                        {new Date().toLocaleDateString("fr-FR")}
                    </p>
                </div>

                <div className="prose dark:prose-invert max-w-none space-y-8">
                    <section>
                        <h2 className="mb-4 text-2xl font-semibold">
                            Introduction
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Chez 06 Analytics, nous nous engageons à protéger
                            votre vie privée. Cette politique de confidentialité
                            explique quelles informations nous collectons,
                            comment nous les utilisons et vos droits concernant
                            vos données personnelles.
                        </p>
                        <p className="text-muted-foreground mt-4 leading-relaxed">
                            Cette politique est conforme au Règlement Général
                            sur la Protection des Données (RGPD) et à la loi
                            Informatique et Libertés.
                        </p>
                    </section>

                    <section>
                        <div className="mb-4 flex items-center gap-3">
                            <Database className="text-primary h-6 w-6" />
                            <h2 className="text-2xl font-semibold">
                                1. Données collectées
                            </h2>
                        </div>

                        <h3 className="mt-6 mb-3 text-xl font-semibold">
                            1.1 Données techniques
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Lors de votre navigation sur le portail, nous
                            collectons automatiquement certaines informations
                            techniques :
                        </p>
                        <ul className="text-muted-foreground mt-2 ml-4 list-inside list-disc space-y-2">
                            <li>Adresse IP (anonymisée)</li>
                            <li>Type de navigateur et version</li>
                            <li>Système d&apos;exploitation</li>
                            <li>Pages consultées et durée de visite</li>
                            <li>Date et heure d&apos;accès</li>
                        </ul>

                        <h3 className="mt-6 mb-3 text-xl font-semibold">
                            1.2 Données fournies volontairement
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Si vous utilisez le formulaire de contact ou vous
                            abonnez à la newsletter :
                        </p>
                        <ul className="text-muted-foreground mt-2 ml-4 list-inside list-disc space-y-2">
                            <li>Adresse e-mail</li>
                            <li>Nom (optionnel)</li>
                            <li>Message ou demande</li>
                        </ul>

                        <h3 className="mt-6 mb-3 text-xl font-semibold">
                            1.3 Cookies
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Nous utilisons des cookies strictement nécessaires
                            au fonctionnement du site :
                        </p>
                        <ul className="text-muted-foreground mt-2 ml-4 list-inside list-disc space-y-2">
                            <li>Cookies de session pour la navigation</li>
                            <li>Cookies de préférence (thème sombre/clair)</li>
                            <li>Cookies de sécurité</li>
                        </ul>
                        <p className="text-muted-foreground mt-4 leading-relaxed">
                            Nous n&apos;utilisons pas de cookies de tracking ou
                            publicitaires.
                        </p>
                    </section>

                    <section>
                        <div className="mb-4 flex items-center gap-3">
                            <Eye className="text-primary h-6 w-6" />
                            <h2 className="text-2xl font-semibold">
                                2. Utilisation des données
                            </h2>
                        </div>

                        <p className="text-muted-foreground leading-relaxed">
                            Nous utilisons vos données uniquement pour :
                        </p>
                        <ul className="text-muted-foreground mt-2 ml-4 list-inside list-disc space-y-2">
                            <li>Assurer le bon fonctionnement du portail</li>
                            <li>Améliorer l&apos;expérience utilisateur</li>
                            <li>Répondre à vos demandes de contact</li>
                            <li>
                                Vous envoyer des newsletters (si vous y avez
                                consenti)
                            </li>
                            <li>
                                Analyser les statistiques d&apos;utilisation (de
                                manière anonyme)
                            </li>
                            <li>Prévenir les abus et garantir la sécurité</li>
                        </ul>
                    </section>

                    <section>
                        <div className="mb-4 flex items-center gap-3">
                            <Lock className="text-primary h-6 w-6" />
                            <h2 className="text-2xl font-semibold">
                                3. Protection des données
                            </h2>
                        </div>

                        <p className="text-muted-foreground leading-relaxed">
                            Nous mettons en œuvre des mesures de sécurité
                            appropriées pour protéger vos données :
                        </p>
                        <ul className="text-muted-foreground mt-2 ml-4 list-inside list-disc space-y-2">
                            <li>Chiffrement des communications (HTTPS)</li>
                            <li>Stockage sécurisé des données</li>
                            <li>Accès restreint aux données personnelles</li>
                            <li>Sauvegardes régulières</li>
                            <li>Mises à jour de sécurité régulières</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="mb-4 text-2xl font-semibold">
                            4. Partage des données
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Nous ne vendons, n&apos;échangeons ni ne louons vos
                            données personnelles à des tiers.
                        </p>
                        <p className="text-muted-foreground mt-4 leading-relaxed">
                            Vos données peuvent être partagées uniquement dans
                            les cas suivants :
                        </p>
                        <ul className="text-muted-foreground mt-2 ml-4 list-inside list-disc space-y-2">
                            <li>Avec votre consentement explicite</li>
                            <li>Pour se conformer à une obligation légale</li>
                            <li>Pour protéger nos droits et notre sécurité</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="mb-4 text-2xl font-semibold">
                            5. Conservation des données
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Nous conservons vos données personnelles uniquement
                            pendant la durée nécessaire aux finalités pour
                            lesquelles elles ont été collectées :
                        </p>
                        <ul className="text-muted-foreground mt-2 ml-4 list-inside list-disc space-y-2">
                            <li>Données de navigation : 13 mois maximum</li>
                            <li>
                                Données de contact : jusqu&apos;à votre demande
                                de suppression
                            </li>
                            <li>
                                Newsletter : jusqu&apos;à votre désinscription
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="mb-4 text-2xl font-semibold">
                            6. Vos droits
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Conformément au RGPD, vous disposez des droits
                            suivants :
                        </p>
                        <ul className="text-muted-foreground mt-2 ml-4 list-inside list-disc space-y-2">
                            <li>
                                <strong>Droit d&apos;accès</strong> : obtenir
                                une copie de vos données
                            </li>
                            <li>
                                <strong>Droit de rectification</strong> :
                                corriger vos données inexactes
                            </li>
                            <li>
                                <strong>Droit à l&apos;effacement</strong> :
                                supprimer vos données
                            </li>
                            <li>
                                <strong>Droit à la limitation</strong> : limiter
                                le traitement de vos données
                            </li>
                            <li>
                                <strong>Droit à la portabilité</strong> :
                                recevoir vos données dans un format structuré
                            </li>
                            <li>
                                <strong>Droit d&apos;opposition</strong> : vous
                                opposer au traitement de vos données
                            </li>
                            <li>
                                <strong>
                                    Droit de retirer votre consentement
                                </strong>{" "}
                                : à tout moment
                            </li>
                        </ul>
                        <p className="text-muted-foreground mt-4 leading-relaxed">
                            Pour exercer ces droits, contactez-nous via notre{" "}
                            <Link
                                href="/contact"
                                className="text-primary hover:underline"
                            >
                                page de contact
                            </Link>
                            .
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-4 text-2xl font-semibold">
                            7. Données publiques
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Les données socio-démographiques présentées sur le
                            portail proviennent de sources publiques (INSEE,
                            geo.api.gouv.fr, etc.) et ne contiennent aucune
                            donnée personnelle identifiable.
                        </p>
                        <p className="text-muted-foreground mt-4 leading-relaxed">
                            Ces données sont agrégées et anonymisées
                            conformément aux réglementations en vigueur.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-4 text-2xl font-semibold">
                            8. Modifications de la politique
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Nous nous réservons le droit de modifier cette
                            politique de confidentialité à tout moment. Les
                            modifications entrent en vigueur dès leur
                            publication sur cette page. Nous vous encourageons à
                            consulter régulièrement cette page.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-4 text-2xl font-semibold">
                            9. Contact et réclamations
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Pour toute question concernant cette politique de
                            confidentialité ou pour exercer vos droits,
                            contactez-nous :
                        </p>
                        <div className="bg-muted/50 mt-4 rounded-lg p-4">
                            <p className="font-medium">06 Analytics</p>
                            <p className="text-muted-foreground">
                                Via notre{" "}
                                <Link
                                    href="/contact"
                                    className="text-primary hover:underline"
                                >
                                    formulaire de contact
                                </Link>
                            </p>
                        </div>
                        <p className="text-muted-foreground mt-4 leading-relaxed">
                            Si vous estimez que vos droits ne sont pas
                            respectés, vous pouvez introduire une réclamation
                            auprès de la CNIL (Commission Nationale de
                            l&apos;Informatique et des Libertés) :
                        </p>
                        <div className="bg-muted/50 mt-4 rounded-lg p-4">
                            <p className="font-medium">CNIL</p>
                            <p className="text-muted-foreground">
                                3 Place de Fontenoy, 75007 Paris
                            </p>
                            <p className="text-muted-foreground">
                                <a
                                    href="https://www.cnil.fr"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                >
                                    www.cnil.fr
                                </a>
                            </p>
                        </div>
                    </section>
                </div>

                <div className="mt-12 border-t pt-8">
                    <Link
                        href="/"
                        className="text-primary inline-flex items-center gap-2 hover:underline"
                    >
                        <LucideArrowLeft className="h-4 w-4" />
                        Retour à l&apos;accueil
                    </Link>
                </div>
            </div>
        </>
    );
}
