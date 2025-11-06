-- ===============================
-- ACT (Activity / Employment)
-- ===============================
CREATE TABLE act_t1_employment_status_2022 (
	employment_status VARCHAR(30) NOT NULL UNIQUE CHECK (
		employment_status IN ('Ensemble', 'Salaries', 'Non-salaries')
	), -- Type de statut d'emploi (ensemble, salariés, non-salariés)
	employed_count INT NOT NULL DEFAULT 0, -- Nombre total de personnes employées
	percent_total DECIMAL(4,1) NOT NULL DEFAULT 0.0, -- Pourcentage de la population totale
	percent_part_time DECIMAL(4,1) NOT NULL DEFAULT 0.0, -- Pourcentage travaillant à temps partiel
	percent_women DECIMAL(4,1) NOT NULL DEFAULT 0.0, -- Pourcentage de femmes
	PRIMARY KEY (employment_status)
);

CREATE TABLE act_t2_employment_condition_by_sex_2022 (
	employment_condition VARCHAR(100) NOT NULL, -- Statut ou condition d'emploi
	men_count INT NOT NULL DEFAULT 0, -- Nombre d'hommes
	men_percent DECIMAL(4,1) NOT NULL DEFAULT 0.0, -- Pourcentage d'hommes
	women_count INT NOT NULL DEFAULT 0, -- Nombre de femmes
	women_percent DECIMAL(4,1) NOT NULL DEFAULT 0.0, -- Pourcentage de femmes
	PRIMARY KEY (employment_condition)
);

CREATE TABLE act_t3_salaries_by_age_and_sex_2022 (
	age_group VARCHAR(20) NOT NULL UNIQUE CHECK (
		age_group IN ('Ensemble', '15-24', '25-54', '55-64')
	), -- Tranche d'âge des salaries
	men_count INT NOT NULL DEFAULT 0, -- Nombre d'hommes salariés
	men_part_time_percent DECIMAL(4,1) NOT NULL DEFAULT 0.0, -- Pourcentage d'hommes à temps partiel
	women_count INT NOT NULL DEFAULT 0, -- Nombre de femmes salariées
	women_part_time_percent DECIMAL(4,1) NOT NULL DEFAULT 0.0, -- Pourcentage de femmes à temps partiel
	PRIMARY KEY (age_group)
);

CREATE TABLE act_g1_part_time_share_by_sex (
	sex VARCHAR(10) NOT NULL CHECK (
		-- Sexe de la population
		sex IN ('Hommes', 'Femmes')
	),
	percent_2011 DECIMAL(4,1) NOT NULL DEFAULT 0.0, -- Pourcentage en 2011
	percent_2016 DECIMAL(4,1) NOT NULL DEFAULT 0.0, -- Pourcentage en 2016
	percent_2022 DECIMAL(4,1) NOT NULL DEFAULT 0.0, -- Pourcentage en 2022
	PRIMARY KEY (sex)
);

CREATE TABLE act_t4_work_location_2022 (
	work_location VARCHAR(100) NOT NULL, -- Type de zone de lieu de travail
	count_2011 INT NOT NULL DEFAULT 0, -- Nombre en 2011
	percent_2011 DECIMAL(4,1) NOT NULL DEFAULT 0.0, -- Pourcentage en 2011
	count_2016 INT NOT NULL DEFAULT 0, -- Nombre en 2016
	percent_2016 DECIMAL(4,1) NOT NULL DEFAULT 0.0, -- Pourcentage en 2016
	count_2022 INT NOT NULL DEFAULT 0, -- Nombre en 2022
	percent_2022 DECIMAL(4,1) NOT NULL DEFAULT 0.0, -- Pourcentage en 2022
	PRIMARY KEY (work_location)
);

CREATE TABLE act_g2_transport_mode_share_2022 (
	transport_mode VARCHAR(100) NOT NULL UNIQUE, -- Type de moyen de transport
	percent_2022 DECIMAL(4,1) NOT NULL DEFAULT 0.0, -- Pourcentage d'utilisation en 2022
	PRIMARY KEY (transport_mode)
);

-- ===============================
-- EMP (Employment) — no active CREATE TABLE in EMP.sql (definitions are commented out)
-- ===============================

-- ===============================
-- FAM (Families & Households)
-- ===============================
CREATE TABLE fam_t1_households_by_composition (
	household_type VARCHAR(100) NOT NULL, -- Type de menage (ensemble, menages d'une personne, couples, etc.)
	year_2011_count INT, -- Nombre de menages en 2011
	year_2011_percent DECIMAL(4,1), -- Pourcentage de menages en 2011
	year_2016_count INT, -- Nombre de menages en 2016
	year_2016_percent DECIMAL(4,1), -- Pourcentage de menages en 2016
	year_2022_count INT, -- Nombre de menages en 2022
	year_2022_percent DECIMAL(4,1), -- Pourcentage de menages en 2022
	population_2011 INT, -- Population totale de ces menages en 2011
	population_2016 INT, -- Population totale de ces menages en 2016
	population_2022 INT, -- Population totale de ces menages en 2022
	PRIMARY KEY (household_type)
);

CREATE TABLE fam_g1_household_size_evolution (
	indicator VARCHAR(100) NOT NULL, -- Intitulé de l'indicateur (ici, nombre moyen d'occupants)
	year_1968 DECIMAL(3,2), -- Valeur pour 1968
	year_1975 DECIMAL(3,2), -- Valeur pour 1975
	year_1982 DECIMAL(3,2), -- Valeur pour 1982
	year_1990 DECIMAL(3,2), -- Valeur pour 1990
	year_1999 DECIMAL(3,2), -- Valeur pour 1999
	year_2006 DECIMAL(3,2), -- Valeur pour 2006
	year_2011 DECIMAL(3,2), -- Valeur pour 2011
	year_2016 DECIMAL(3,2), -- Valeur pour 2016
	year_2022 DECIMAL(3,2), -- Valeur pour 2022
	PRIMARY KEY (indicator)
);

CREATE TABLE fam_g2_people_living_alone_by_age (
	age_category VARCHAR(20) NOT NULL, -- Tranche d'âge
	year_2011_percent DECIMAL(4,1), -- Pourcentage en 2011
	year_2016_percent DECIMAL(4,1), -- Pourcentage en 2016
	year_2022_percent DECIMAL(4,1), -- Pourcentage en 2022
	PRIMARY KEY (age_category)
);

CREATE TABLE fam_g3_people_in_couple_by_age (
	age_category VARCHAR(20) NOT NULL, -- Tranche d'âge
	year_2011_percent DECIMAL(4,1), -- Pourcentage en 2011
	year_2016_percent DECIMAL(4,1), -- Pourcentage en 2016
	year_2022_percent DECIMAL(4,1), -- Pourcentage en 2022
	PRIMARY KEY (age_category)
);

CREATE TABLE fam_g4_marital_status_2022 (
	marital_status VARCHAR(50) NOT NULL, -- Statut conjugal (marié, pacsé, célibataire, etc.)
	percent DECIMAL(4,1), -- Pourcentage correspondant au statut
	PRIMARY KEY (marital_status)
);

CREATE TABLE fam_t2_households_by_professional_group_2022 (
	group_name VARCHAR(100) NOT NULL, -- Groupe socioprofessionnel
	household_count INT, -- Nombre de menages
	household_percent DECIMAL(4,1), -- Pourcentage de menages
	population_count INT, -- Population totale des menages du groupe
	population_percent DECIMAL(4,1), -- Pourcentage de la population
	PRIMARY KEY (group_name)
);

CREATE TABLE fam_g5_household_distribution_by_professional_group_2022 (
	group_name VARCHAR(100) NOT NULL, -- Groupe socioprofessionnel
	percent DECIMAL(4,1), -- Pourcentage des menages appartenant à ce groupe
	PRIMARY KEY (group_name)
);

CREATE TABLE fam_t3_family_composition (
	family_type VARCHAR(100) NOT NULL, -- Type de famille (couples, familles monoparentales, etc.)
	year_2011_count INT, -- Nombre de familles en 2011
	year_2011_percent DECIMAL(4,1), -- Pourcentage en 2011
	year_2016_count INT, -- Nombre de familles en 2016
	year_2016_percent DECIMAL(4,1), -- Pourcentage en 2016
	year_2022_count INT, -- Nombre de familles en 2022
	year_2022_percent DECIMAL(4,1), -- Pourcentage en 2022
	PRIMARY KEY (family_type)
);

CREATE TABLE fam_t3bis_couples_with_children_families (
	family_type VARCHAR(100) NOT NULL, -- Type de famille (ensemble, traditionnelle, recomposee)
	count_2022 INT, -- Nombre de familles en 2022
	percent_2022 DECIMAL(4,1), -- Pourcentage en 2022
	PRIMARY KEY (family_type)
);

CREATE TABLE fam_t4_families_by_number_of_children (
	children_count_category VARCHAR(30) NOT NULL, -- Categorie du nombre d'enfants (aucun, 1, 2, etc.)
	year_2011_count INT, -- Nombre de familles en 2011
	year_2011_percent DECIMAL(4,1), -- Pourcentage en 2011
	year_2016_count INT, -- Nombre de familles en 2016
	year_2016_percent DECIMAL(4,1), -- Pourcentage en 2016
	year_2022_count INT, -- Nombre de familles en 2022
	year_2022_percent DECIMAL(4,1), -- Pourcentage en 2022
	PRIMARY KEY (children_count_category)
);

-- ===============================
-- FOR (Education / Formation)
-- ===============================
CREATE TABLE for_t1_schooling_by_age_and_sex_2022 (
	age_group VARCHAR(30) NOT NULL, -- Tranche d'âge (ex : 2 à 5 ans, 6 à 10 ans, etc.)
	total_population INT, -- Population totale
	schooled_population INT, -- Population scolarisée
	schooling_rate_total DECIMAL(4,1), -- Part de la population scolarisée en %
	schooling_rate_male DECIMAL(4,1), -- Part de la population masculine scolarisée en %
	schooling_rate_female DECIMAL(4,1), -- Part de la population féminine scolarisée en %
	PRIMARY KEY (age_group)
);

CREATE TABLE for_g1_school_enrollment_rate_by_age (
	age_group VARCHAR(30) NOT NULL, -- Tranche d'âge (ex : 2 à 5 ans, 6 à 10 ans, etc.)
	rate_2011 DECIMAL(4,1), -- Taux de scolarisation en 2011
	rate_2016 DECIMAL(4,1), -- Taux de scolarisation en 2016
	rate_2022 DECIMAL(4,1), -- Taux de scolarisation en 2022
	PRIMARY KEY (age_group)
);

CREATE TABLE for_t2_highest_diploma_non_schooled_population_by_sex_2022 (
	diploma VARCHAR(80) NOT NULL, -- Diplôme le plus élevé (aucun diplôme, CAP, bac, etc.)
	total_population DECIMAL(6,1), -- Valeur pour l'ensemble de la population ou %
	male_population DECIMAL(6,1), -- Valeur pour les hommes
	female_population DECIMAL(6,1), -- Valeur pour les femmes
	PRIMARY KEY (diploma)
);

CREATE TABLE for_g2_highest_diploma_non_schooled_population_percentage (
	diploma VARCHAR(80) NOT NULL, -- Diplôme le plus élevé (aucun diplôme, bac, enseignement supérieur, etc.)
	rate_2011 DECIMAL(4,1), -- Pourcentage en 2011
	rate_2022 DECIMAL(4,1), -- Pourcentage en 2022
	PRIMARY KEY (diploma)
);

-- ===============================
-- IMG1A (Immigration status by sex & age)
-- ===============================
CREATE TABLE img1a_ensemble_population_immigration_2022 (
	immigration_status VARCHAR(30) NOT NULL CHECK (
		immigration_status IN ('Immigres', 'Non immigres', 'Ensemble')
	), -- Situation quant à l'immigration (immigrés, non immigrés, ensemble)
	less_than_15 INT, -- Population de moins de 15 ans
	from_15_to_24 INT, -- Population de 15 à 24 ans
	from_25_to_54 INT, -- Population de 25 à 54 ans
	over_55 INT, -- Population de 55 ans ou plus
	total INT, -- Ensemble de la population
	PRIMARY KEY (immigration_status)
);

CREATE TABLE img1a_hommes_population_immigration_2022 (
	immigration_status VARCHAR(30) NOT NULL CHECK (
		immigration_status IN ('Immigres', 'Non immigres', 'Ensemble')
	), -- Situation quant à l'immigration (immigrés, non immigrés, ensemble)
	less_than_15 INT, -- Population masculine de moins de 15 ans
	from_15_to_24 INT, -- Population masculine de 15 à 24 ans
	from_25_to_54 INT, -- Population masculine de 25 à 54 ans
	over_55 INT, -- Population masculine de 55 ans ou plus
	total INT, -- Ensemble de la population masculine
	PRIMARY KEY (immigration_status)
);

CREATE TABLE img1a_femmes_population_immigration_2022 (
	immigration_status VARCHAR(30) NOT NULL CHECK (
		immigration_status IN ('Immigres', 'Non immigres', 'Ensemble')
	), -- Situation quant à l'immigration (immigrés, non immigrés, ensemble)
	less_than_15 INT, -- Population féminine de moins de 15 ans
	from_15_to_24 INT, -- Population féminine de 15 à 24 ans
	from_25_to_54 INT, -- Population féminine de 25 à 54 ans
	over_55 INT, -- Population féminine de 55 ans ou plus
	total INT, -- Ensemble de la population féminine
	PRIMARY KEY (immigration_status)
);

-- ===============================
-- IMG1B (Immigration by country of birth)
-- ===============================
CREATE TABLE img1b_ensemble_regroupe_population_immigration_2022 (
	country_of_birth VARCHAR(60) NOT NULL, -- Pays de naissance (Portugal, Italie, Espagne, etc.)
	less_than_15 INT, -- Population immigrée de moins de 15 ans
	from_15_to_24 INT, -- Population immigrée de 15 à 24 ans
	from_25_to_54 INT, -- Population immigrée de 25 à 54 ans
	over_55 INT, -- Population immigrée de 55 ans ou plus
	total INT, -- Ensemble de la population immigrée
	PRIMARY KEY (country_of_birth)
);

CREATE TABLE img1b_hommes_regroupe_population_immigration_2022 (
	country_of_birth VARCHAR(60) NOT NULL, -- Pays de naissance (Portugal, Italie, Espagne, etc.)
	less_than_15 INT, -- Population masculine immigrée de moins de 15 ans
	from_15_to_24 INT, -- Population masculine immigrée de 15 à 24 ans
	from_25_to_54 INT, -- Population masculine immigrée de 25 à 54 ans
	over_55 INT, -- Population masculine immigrée de 55 ans ou plus
	total INT, -- Ensemble de la population masculine immigrée
	PRIMARY KEY (country_of_birth)
);

CREATE TABLE img1b_femmes_regroupe_population_immigration_2022 (
	country_of_birth VARCHAR(60) NOT NULL, -- Pays de naissance (Portugal, Italie, Espagne, etc.)
	less_than_15 INT, -- Population féminine immigrée de moins de 15 ans
	from_15_to_24 INT, -- Population féminine immigrée de 15 à 24 ans
	from_25_to_54 INT, -- Population féminine immigrée de 25 à 54 ans
	over_55 INT, -- Population féminine immigrée de 55 ans ou plus
	total INT, -- Ensemble de la population féminine immigrée
	PRIMARY KEY (country_of_birth)
);

CREATE TABLE img1b_ensemble_detaille_population_immigration_2022 (
	country_of_birth VARCHAR(100) NOT NULL, -- Pays de naissance détaillé (Portugal, Italie, Allemagne, Maroc, etc.)
	less_than_15 INT,
	from_15_to_24 INT,
	from_25_to_54 INT,
	over_55 INT,
	total INT,
	PRIMARY KEY (country_of_birth)
);

CREATE TABLE img1b_hommes_detaille_population_immigration_2022 (
	country_of_birth VARCHAR(100) NOT NULL,
	less_than_15 INT,
	from_15_to_24 INT,
	from_25_to_54 INT,
	over_55 INT,
	total INT,
	PRIMARY KEY (country_of_birth)
);

CREATE TABLE img1b_femmes_detaille_population_immigration_2022 (
	country_of_birth VARCHAR(100) NOT NULL,
	less_than_15 INT,
	from_15_to_24 INT,
	from_25_to_54 INT,
	over_55 INT,
	total INT,
	PRIMARY KEY (country_of_birth)
);

-- ===============================
-- LOG (Logement / Housing)
-- ===============================
CREATE TABLE log_t1_evolution_of_housing_by_category (
	housing_category VARCHAR(80) NOT NULL, -- Catégorie de logement (ensemble, résidences principales, etc.)
	year_1968 INT, -- Nombre de logements en 1968
	year_1975 INT, -- Nombre de logements en 1975
	year_1982 INT, -- Nombre de logements en 1982
	year_1990 INT, -- Nombre de logements en 1990
	year_1999 INT, -- Nombre de logements en 1999
	year_2006 INT, -- Nombre de logements en 2006
	year_2011 INT, -- Nombre de logements en 2011
	year_2016 INT, -- Nombre de logements en 2016
	year_2022 INT, -- Nombre de logements en 2022
	PRIMARY KEY (housing_category)
);

CREATE TABLE log_t1bis_housing_categories (
	housing_category VARCHAR(80) NOT NULL, -- Catégorie de logement
	percent_2011 DECIMAL(4,1), -- Pourcentage en 2011
	percent_2016 DECIMAL(4,1), -- Pourcentage en 2016
	percent_2022 DECIMAL(4,1), -- Pourcentage en 2022
	PRIMARY KEY (housing_category)
);

CREATE TABLE log_t2_types_of_housing (
	housing_type VARCHAR(40) NOT NULL, -- Type de logement (maison, appartement, etc.)
	number_2011 INT,
	percent_2011 DECIMAL(4,1),
	number_2016 INT,
	percent_2016 DECIMAL(4,1),
	number_2022 INT,
	percent_2022 DECIMAL(4,1),
	PRIMARY KEY (housing_type)
);

CREATE TABLE log_t2bis_contributions_to_change_in_main_residences (
	contribution_type VARCHAR(80) NOT NULL, -- Type de contribution (effet taille, effet démographique, etc.)
	change_2011_2016 INT,
	percent_2011_2016 DECIMAL(4,1),
	change_2016_2022 INT,
	percent_2016_2022 DECIMAL(4,1),
	PRIMARY KEY (contribution_type)
);

CREATE TABLE log_t3_main_residences_by_number_of_rooms (
	number_of_rooms VARCHAR(30) NOT NULL, -- Nombre de pièces
	number_2011 INT,
	percent_2011 DECIMAL(4,1),
	number_2016 INT,
	percent_2016 DECIMAL(4,1),
	number_2022 INT,
	percent_2022 DECIMAL(4,1),
	PRIMARY KEY (number_of_rooms)
);

CREATE TABLE log_t4_average_number_of_rooms_in_main_residences (
	residence_type VARCHAR(40) NOT NULL, -- Type de résidence principale
	avg_rooms_2011 DECIMAL(3,1),
	avg_rooms_2016 DECIMAL(3,1),
	avg_rooms_2022 DECIMAL(3,1),
	PRIMARY KEY (residence_type)
);

CREATE TABLE log_t4bis_occupancy_index_of_main_residences (
	occupancy_index VARCHAR(50) NOT NULL, -- Indice de peuplement (suroccupation, sous-occupation, etc.)
	percent_2011 DECIMAL(4,1),
	percent_2016 DECIMAL(4,1),
	percent_2022 DECIMAL(4,1),
	PRIMARY KEY (occupancy_index)
);

CREATE TABLE log_t5_main_residences_by_completion_period_2022 (
	completion_period VARCHAR(40) NOT NULL, -- Période d'achèvement
	number INT, -- Nombre de logements
	percent DECIMAL(4,1), -- Pourcentage
	PRIMARY KEY (completion_period)
);

CREATE TABLE log_g1_main_residences_by_type_and_completion_period_2022 (
	completion_period VARCHAR(40) NOT NULL, -- Période d'achèvement
	houses INT, -- Nombre de maisons
	apartments INT, -- Nombre d'appartements
	PRIMARY KEY (completion_period)
);

CREATE TABLE log_t6_length_of_stay_in_main_residence_2022 (
	stay_length VARCHAR(40) NOT NULL, -- Ancienneté d'emménagement
	households_number INT, -- Nombre de ménages
	households_percent DECIMAL(4,1), -- Part des ménages en %
	households_population INT, -- Population des ménages
	avg_rooms_per_dwelling DECIMAL(3,1), -- Nombre moyen de pièces par logement
	avg_rooms_per_person DECIMAL(3,1), -- Nombre moyen de pièces par personne
	PRIMARY KEY (stay_length)
);

CREATE TABLE log_g2_households_length_of_stay_2022 (
	stay_length VARCHAR(40) NOT NULL, -- Ancienneté d'emménagement
	households_percent DECIMAL(4,1), -- Part des ménages en %
	PRIMARY KEY (stay_length)
);

CREATE TABLE log_t7_main_residences_by_tenure_status (
	tenure_status VARCHAR(80) NOT NULL, -- Statut d'occupation (propriétaire, locataire, etc.)
	number_2011 INT,
	percent_2011 DECIMAL(4,1),
	number_2016 INT,
	percent_2016 DECIMAL(4,1),
	number_2022 INT,
	percent_2022 DECIMAL(4,1),
	persons_number INT,
	avg_stay_years DECIMAL(4,1),
	PRIMARY KEY (tenure_status)
);

CREATE TABLE log_t8m_main_residences_heating_fuel (
	fuel_type VARCHAR(60) NOT NULL, -- Type de combustible principal
	number_2011 INT,
	percent_2011 DECIMAL(4,1),
	number_2016 INT,
	percent_2016 DECIMAL(4,1),
	number_2022 INT,
	percent_2022 DECIMAL(4,1),
	PRIMARY KEY (fuel_type)
);

CREATE TABLE log_t9_households_car_ownership (
	car_equipment VARCHAR(60) NOT NULL, -- Type d'équipement automobile
	number_2011 INT,
	percent_2011 DECIMAL(4,1),
	number_2016 INT,
	percent_2016 DECIMAL(4,1),
	number_2022 INT,
	percent_2022 DECIMAL(4,1),
	PRIMARY KEY (car_equipment)
);

-- ===============================
-- POP (Population)
-- ===============================
CREATE TABLE pop_t0_population_by_age_group (
age_group VARCHAR(30) NOT NULL, -- Tranche d'age (ex : 0 a 14 ans, 15 a 29 ans, etc.)
population_2011 INT, -- Population en 2011
percent_2011 DECIMAL(4,1), -- Pourcentage en 2011
population_2016 INT, -- Population en 2016
percent_2016 DECIMAL(4,1), -- Pourcentage en 2016
population_2022 INT, -- Population en 2022
percent_2022 DECIMAL(4,1), -- Pourcentage en 2022
PRIMARY KEY (age_group)
);

CREATE TABLE pop_g2_population_by_age_group (
age_group VARCHAR(30) NOT NULL, -- Tranche d'age
percent_2011 DECIMAL(4,1), -- Pourcentage en 2011
percent_2016 DECIMAL(4,1), -- Pourcentage en 2016
percent_2022 DECIMAL(4,1), -- Pourcentage en 2022
PRIMARY KEY (age_group)
);

CREATE TABLE pop_t1_population_history (
indicator VARCHAR(60) NOT NULL, -- Type d'indicateur (Population, Densite, etc.)
y1968 DECIMAL(6,1), -- Valeur en 1968
y1975 DECIMAL(6,1), -- Valeur en 1975
y1982 DECIMAL(6,1), -- Valeur en 1982
y1990 DECIMAL(6,1), -- Valeur en 1990
y1999 DECIMAL(6,1), -- Valeur en 1999
y2006 DECIMAL(6,1), -- Valeur en 2006
y2011 DECIMAL(6,1), -- Valeur en 2011
y2016 DECIMAL(6,1), -- Valeur en 2016
y2022 DECIMAL(6,1), -- Valeur en 2022
PRIMARY KEY (indicator)
);

CREATE TABLE pop_t2m_demographic_indicators (
indicator VARCHAR(100) NOT NULL, -- Type d'indicateur demographique
period_1968_1975 DECIMAL(4,1),
period_1975_1982 DECIMAL(4,1),
period_1982_1990 DECIMAL(4,1),
period_1990_1999 DECIMAL(4,1),
period_1999_2006 DECIMAL(4,1),
period_2006_2011 DECIMAL(4,1),
period_2011_2016 DECIMAL(4,1),
period_2016_2022 DECIMAL(4,1),
PRIMARY KEY (indicator)
);

CREATE TABLE pop_t3_population_by_sex_and_age_2022 (
age_group VARCHAR(30) NOT NULL, -- Tranche d'age
men INT, -- Nombre d'hommes
percent_men DECIMAL(4,1), -- Pourcentage d'hommes
women INT, -- Nombre de femmes
percent_women DECIMAL(4,1), -- Pourcentage de femmes
PRIMARY KEY (age_group)
);

CREATE TABLE pop_t3bis_population_by_sex_and_age_2022 (
age_group VARCHAR(30) NOT NULL,
men INT,
percent_men DECIMAL(4,1),
women INT,
percent_women DECIMAL(4,1),
PRIMARY KEY (age_group)
);

CREATE TABLE pop_t4_previous_residence (
residence_place VARCHAR(80) NOT NULL, -- Lieu de residence un an auparavant
population_2011 INT,
percent_2011 DECIMAL(4,1),
population_2016 INT,
percent_2016 DECIMAL(4,1),
population_2022 INT,
percent_2022 DECIMAL(4,1),
PRIMARY KEY (residence_place)
);

CREATE TABLE pop_g3_previous_residence_by_age (
age_group VARCHAR(30) NOT NULL,
same_commune_percent DECIMAL(4,1), -- Pourcentage dans la meme commune
other_commune_percent DECIMAL(4,1), -- Pourcentage dans une autre commune
PRIMARY KEY (age_group)
);

CREATE TABLE pop_t5_population_by_professional_group (
socio_professional_group VARCHAR(80) NOT NULL, -- Groupe socioprofessionnel
population_2011 INT,
percent_2011 DECIMAL(4,1),
population_2016 INT,
percent_2016 DECIMAL(4,1),
population_2022 INT,
percent_2022 DECIMAL(4,1),
PRIMARY KEY (socio_professional_group)
);

CREATE TABLE pop_t6_population_by_sex_age_professional_group_2022 (
socio_professional_group VARCHAR(80) NOT NULL,
men INT,
women INT,
percent_15_24 DECIMAL(4,1),
percent_25_54 DECIMAL(4,1),
percent_55_plus DECIMAL(4,1),
PRIMARY KEY (socio_professional_group)
);
