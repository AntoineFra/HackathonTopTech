import swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition = {
    openapi: "3.0.0",
    info: {
        title: "Hackathon TopTech API",
        version: "1.0.0",
        description:
            "API complète pour le projet Hackathon TopTech - Gestion des données géographiques, IA et unités légales",
        contact: {
            name: "API Support",
            email: "support@hackathon.com",
        },
    },
    servers: [
        {
            url: "http://localhost:3000",
            description: "Serveur de développement",
        },
        {
            url: "http://localhost:8080",
            description: "Serveur de développement (port alternatif)",
        },
    ],
    tags: [
        {
            name: "Dump",
            description:
                "Gestion des imports de données (unités légales, villes)",
        },
        {
            name: "Users",
            description: "Gestion des utilisateurs",
        },
        {
            name: "AI",
            description: "Intelligence artificielle et chatbot Ollama",
        },
        {
            name: "3D",
            description: "Données géographiques pour la visualisation 3D",
        },
        {
            name: "Settings",
            description: "Configuration de l'application",
        },
    ],
    components: {
        schemas: {
            User: {
                type: "object",
                properties: {
                    id: {
                        type: "integer",
                        description: "ID unique de l'utilisateur",
                        example: 1,
                    },
                    email: {
                        type: "string",
                        format: "email",
                        description: "Email de l'utilisateur",
                        example: "user@example.com",
                    },
                    name: {
                        type: "string",
                        description: "Nom de l'utilisateur",
                        example: "John Doe",
                        nullable: true,
                    },
                },
            },
            CreateUserInput: {
                type: "object",
                required: ["email", "name"],
                properties: {
                    email: {
                        type: "string",
                        format: "email",
                        description: "Email de l'utilisateur",
                        example: "user@example.com",
                    },
                    name: {
                        type: "string",
                        description: "Nom de l'utilisateur",
                        example: "John Doe",
                    },
                },
            },
            City: {
                type: "object",
                properties: {
                    codeINSEE: {
                        type: "string",
                        description: "Code INSEE de la ville",
                        example: "06001",
                    },
                    name: {
                        type: "string",
                        description: "Nom de la ville",
                        example: "Aiglun",
                    },
                    codeDepartement: {
                        type: "string",
                        description: "Code du département",
                        example: "06",
                    },
                    siren: {
                        type: "string",
                        description: "SIREN de la commune",
                        example: "210600011",
                    },
                    codeEpci: {
                        type: "string",
                        description: "Code EPCI",
                        example: "200039931",
                    },
                    codeRegion: {
                        type: "string",
                        description: "Code de la région",
                        example: "93",
                    },
                    population: {
                        type: "integer",
                        description: "Population de la ville",
                        example: 99,
                    },
                    surface: {
                        type: "number",
                        format: "float",
                        description: "Surface en hectares",
                        example: 1234.56,
                        nullable: true,
                    },
                    zone: {
                        type: "string",
                        description: "Zone géographique (metro, etc.)",
                        example: "metro",
                        nullable: true,
                    },
                    postalCodes: {
                        type: "array",
                        items: {
                            $ref: "#/components/schemas/PostalCode",
                        },
                    },
                    geoData: {
                        $ref: "#/components/schemas/CityGeoData",
                        nullable: true,
                    },
                },
            },
            PostalCode: {
                type: "object",
                properties: {
                    id: {
                        type: "integer",
                        description: "ID du code postal",
                        example: 1,
                    },
                    code: {
                        type: "string",
                        description: "Code postal",
                        example: "06910",
                    },
                    cityCodeINSEE: {
                        type: "string",
                        description: "Code INSEE de la ville associée",
                        example: "06001",
                    },
                },
            },
            CityGeoData: {
                type: "object",
                properties: {
                    id: {
                        type: "integer",
                        description: "ID des données géographiques",
                        example: 1,
                    },
                    cityCodeINSEE: {
                        type: "string",
                        description: "Code INSEE de la ville",
                        example: "06001",
                    },
                    centreLat: {
                        type: "number",
                        format: "float",
                        description: "Latitude du centre de la ville",
                        example: 43.8475,
                        nullable: true,
                    },
                    centreLon: {
                        type: "number",
                        format: "float",
                        description: "Longitude du centre de la ville",
                        example: 6.9166,
                        nullable: true,
                    },
                    mairieLat: {
                        type: "number",
                        format: "float",
                        description: "Latitude de la mairie",
                        example: 43.848,
                        nullable: true,
                    },
                    mairieLon: {
                        type: "number",
                        format: "float",
                        description: "Longitude de la mairie",
                        example: 6.917,
                        nullable: true,
                    },
                    contour: {
                        type: "string",
                        description: "Contour GeoJSON de la ville (stringifié)",
                        nullable: true,
                    },
                    bbox: {
                        type: "string",
                        description:
                            "Bounding box GeoJSON de la ville (stringifié)",
                        nullable: true,
                    },
                },
            },
            Dump: {
                type: "object",
                properties: {
                    id: {
                        type: "integer",
                        description: "ID du dump",
                        example: 1,
                    },
                    type: {
                        type: "string",
                        enum: ["legal_unit", "cities"],
                        description: "Type de dump",
                        example: "cities",
                    },
                    status: {
                        type: "string",
                        enum: ["PAS_A_JOUR", "A_JOUR", "EN_COURS"],
                        description: "Statut du dump",
                        example: "A_JOUR",
                    },
                    lastUpdate: {
                        type: "string",
                        format: "date-time",
                        description: "Date de la dernière mise à jour",
                        example: "2025-11-06T05:00:00Z",
                        nullable: true,
                    },
                    label: {
                        type: "string",
                        description: "Label lisible du type de dump",
                        example: "Villes",
                    },
                },
            },
            DumpResult: {
                type: "object",
                properties: {
                    success: {
                        type: "boolean",
                        description: "Indique si le dump a réussi",
                        example: true,
                    },
                    message: {
                        type: "string",
                        description: "Message de succès",
                        example: "Villes dumped successfully",
                    },
                    data: {
                        type: "object",
                        properties: {
                            count: {
                                type: "integer",
                                description: "Nombre d'éléments importés",
                                example: 150,
                            },
                            summary: {
                                type: "object",
                                description: "Résumé de l'import",
                                properties: {
                                    cities: {
                                        type: "integer",
                                        example: 150,
                                    },
                                    postalCodes: {
                                        type: "integer",
                                        example: 180,
                                    },
                                    geoData: {
                                        type: "integer",
                                        example: 145,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            AIRequest: {
                type: "object",
                required: ["question"],
                properties: {
                    question: {
                        type: "string",
                        description: "Question à poser à l'IA",
                        example: "Quelle est la population de Nice?",
                    },
                    history: {
                        type: "array",
                        description: "Historique de conversation",
                        items: {
                            type: "object",
                            properties: {
                                role: {
                                    type: "string",
                                    enum: ["user", "assistant"],
                                    example: "user",
                                },
                                content: {
                                    type: "string",
                                    example: "Bonjour",
                                },
                            },
                        },
                    },
                },
            },
            AIResponse: {
                type: "object",
                properties: {
                    answer: {
                        type: "string",
                        description: "Réponse de l'IA",
                        example:
                            "La population de Nice est de 340 000 habitants environ.",
                    },
                    model: {
                        type: "string",
                        description: "Modèle utilisé",
                        example: "llama3.2",
                    },
                    timestamp: {
                        type: "string",
                        format: "date-time",
                        description: "Horodatage de la réponse",
                        example: "2025-11-06T05:00:00Z",
                    },
                },
            },
            AIHealth: {
                type: "object",
                properties: {
                    status: {
                        type: "string",
                        enum: ["healthy", "unhealthy", "error"],
                        description: "État de santé du service IA",
                        example: "healthy",
                    },
                    message: {
                        type: "string",
                        description: "Message de statut",
                        example: "Ollama is running",
                    },
                    model: {
                        type: "string",
                        description: "Modèle disponible",
                        example: "llama3.2",
                        nullable: true,
                    },
                },
            },
            Settings: {
                type: "object",
                properties: {
                    id: {
                        type: "integer",
                        description: "ID des paramètres",
                        example: 1,
                    },
                    aiTimeout: {
                        type: "integer",
                        description:
                            "Timeout en millisecondes pour les requêtes IA",
                        example: 30000,
                    },
                },
            },
            UpdateSettingsInput: {
                type: "object",
                properties: {
                    aiTimeout: {
                        type: "integer",
                        description:
                            "Timeout en millisecondes pour les requêtes IA (0-10000000)",
                        example: 45000,
                        minimum: 0,
                        maximum: 10000000,
                    },
                },
            },
            Error: {
                type: "object",
                properties: {
                    error: {
                        type: "string",
                        description: "Message d'erreur",
                        example: "Internal server error",
                    },
                    message: {
                        type: "string",
                        description: "Détails de l'erreur",
                        example: "Une erreur s'est produite",
                        nullable: true,
                    },
                    details: {
                        type: "string",
                        description: "Détails techniques de l'erreur",
                        nullable: true,
                    },
                },
            },
        },
    },
};

const options: swaggerJSDoc.Options = {
    definition: swaggerDefinition,
    apis: ["./routes/*.ts", "./controllers/*.ts"], // Fichiers contenant les annotations
};

export const swaggerSpec = swaggerJSDoc(options);
