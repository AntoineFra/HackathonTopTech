import Link from "next/link";
import { LucideArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function TermsPage() {
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
                    <h1 className="mb-4 text-4xl font-bold">
                        Conditions Générales d&apos;Utilisation
                    </h1>
                    <p className="text-muted-foreground">
                        Dernière mise à jour :{" "}
                        {new Date().toLocaleDateString("fr-FR")}
                    </p>
                </div>

                <div className="prose dark:prose-invert max-w-none space-y-8">
                    <section>
                        <h2 className="mb-4 text-2xl font-semibold">
                            1. Objet
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Les présentes Conditions Générales
                            d&apos;Utilisation (CGU) ont pour objet de définir
                            les modalités et conditions d&apos;utilisation du
                            portail 06 Analytics, ainsi que les droits et
                            obligations des utilisateurs dans ce cadre.
                        </p>
                        <p className="text-muted-foreground mt-4 leading-relaxed">
                            Le portail 06 Analytics est une plateforme de
                            visualisation et d&apos;analyse de données
                            socio-démographiques concernant le département des
                            Alpes-Maritimes (06).
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-4 text-2xl font-semibold">
                            2. Accès au service
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Le service est accessible gratuitement à tout
                            utilisateur disposant d&apos;un accès à internet.
                            Tous les coûts afférents à l&apos;accès au service,
                            que ce soient les frais matériels, logiciels ou
                            d&apos;accès à internet sont exclusivement à la
                            charge de l&apos;utilisateur.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-4 text-2xl font-semibold">
                            3. Propriété intellectuelle
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Le contenu du portail 06 Analytics (structure,
                            textes, graphiques, logos, icônes, sons, logiciels,
                            etc.) est la propriété exclusive de 06 Analytics, à
                            l&apos;exception des données publiques issues de
                            sources gouvernementales.
                        </p>
                        <p className="text-muted-foreground mt-4 leading-relaxed">
                            Les données sont issues de sources publiques telles
                            que :
                        </p>
                        <ul className="text-muted-foreground mt-2 ml-4 list-inside list-disc space-y-2">
                            <li>
                                INSEE (Institut National de la Statistique et
                                des Études Économiques)
                            </li>
                            <li>geo.api.gouv.fr (API Géographique)</li>
                            <li>
                                data.gouv.fr (Plateforme ouverte des données
                                publiques françaises)
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="mb-4 text-2xl font-semibold">
                            4. Utilisation des données
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Les données présentées sur le portail sont fournies
                            à titre informatif. Bien que nous nous efforcions de
                            maintenir l&apos;exactitude et l&apos;actualité des
                            informations, nous ne pouvons garantir leur
                            exhaustivité ou leur absence d&apos;erreur.
                        </p>
                        <p className="text-muted-foreground mt-4 leading-relaxed">
                            L&apos;utilisateur est autorisé à :
                        </p>
                        <ul className="text-muted-foreground mt-2 ml-4 list-inside list-disc space-y-2">
                            <li>
                                Consulter et visualiser les données sur le
                                portail
                            </li>
                            <li>
                                Exporter les données pour un usage personnel ou
                                professionnel non commercial
                            </li>
                            <li>Partager les liens vers les visualisations</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="mb-4 text-2xl font-semibold">
                            5. Responsabilités
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            06 Analytics ne saurait être tenu responsable des
                            dommages directs ou indirects résultant de
                            l&apos;utilisation du portail ou de
                            l&apos;impossibilité d&apos;y accéder.
                        </p>
                        <p className="text-muted-foreground mt-4 leading-relaxed">
                            L&apos;utilisateur s&apos;engage à utiliser le
                            service de manière responsable et conforme aux lois
                            en vigueur.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-4 text-2xl font-semibold">
                            6. Disponibilité du service
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Le service est accessible 24h/24, 7j/7, sauf en cas
                            de force majeure ou de maintenance. 06 Analytics se
                            réserve le droit de suspendre, d&apos;interrompre ou
                            de limiter l&apos;accès au service sans préavis.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-4 text-2xl font-semibold">
                            7. Modifications des CGU
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            06 Analytics se réserve le droit de modifier les
                            présentes CGU à tout moment. Les utilisateurs seront
                            informés des modifications par une notification sur
                            le portail.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-4 text-2xl font-semibold">
                            8. Droit applicable
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Les présentes CGU sont régies par le droit français.
                            Tout litige relatif à leur interprétation ou leur
                            exécution relève de la compétence exclusive des
                            tribunaux français.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-4 text-2xl font-semibold">
                            9. Contact
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Pour toute question concernant ces conditions
                            générales d&apos;utilisation, vous pouvez nous
                            contacter via notre{" "}
                            <Link
                                href="/contact"
                                className="text-primary hover:underline"
                            >
                                page de contact
                            </Link>
                            .
                        </p>
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
