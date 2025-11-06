import re
import os
import json
from datetime import datetime

os.environ["GOOGLE_API_KEY"] = "AIzaSyCoFnPPRP8d0NXtoGqi7pYOEAVK0AGw0yc"
import chromadb
import pandas as pd
import sqlite3
from langchain_ollama import OllamaLLM
from langchain_google_genai import ChatGoogleGenerativeAI
from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

chroma_client = chromadb.Client()

# Instantiate both LLMs: Google (for reformulation/planning) and Ollama (for SQL generation)
google_llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash")
collection = chroma_client.create_collection(name="table_collection")

collection.add(
    ids=[
        "act_t1_employment_status_2022",
        "act_t2_employment_condition_by_sex_2022",
        "act_t3_salaries_by_age_and_sex_2022",
        "act_g1_part_time_share_by_sex",
        "act_t4_work_location_2022",
        "act_g2_transport_mode_share_2022",
        "fam_t1_households_by_composition",
        "fam_g1_household_size_evolution",
        "fam_g2_people_living_alone_by_age",
        "fam_g3_people_in_couple_by_age",
        "fam_g4_marital_status_2022",
        "fam_t2_households_by_professional_group_2022",
        "fam_g5_household_distribution_by_professional_group_2022",
        "fam_t3_family_composition",
        "fam_t3bis_couples_with_children_families",
        "fam_t4_families_by_number_of_children",
        "for_t1_schooling_by_age_and_sex_2022",
        "for_g1_school_enrollment_rate_by_age",
        "for_t2_highest_diploma_non_schooled_population_by_sex_2022",
        "for_g2_highest_diploma_non_schooled_population_percentage",
        "log_t1_evolution_of_housing_by_category",
        "log_t1bis_housing_categories",
        "log_t2_types_of_housing",
        "log_t2bis_contributions_to_change_in_main_residences",
        "log_t3_main_residences_by_number_of_rooms",
        "log_t4_average_number_of_rooms_in_main_residences",
        "log_t4bis_occupancy_index_of_main_residences",
        "log_t5_main_residences_by_completion_period_2022",
        "log_g1_main_residences_by_type_and_completion_period_2022",
        "log_t6_length_of_stay_in_main_residence_2022",
        "log_g2_households_length_of_stay_2022",
        "log_t7_main_residences_by_tenure_status",
        "log_t8m_main_residences_heating_fuel",
        "log_t9_households_car_ownership",
        "pop_t0_population_by_age_group",
        "pop_g2_population_by_age_group",
        "pop_t1_population_history",
        "pop_t2m_demographic_indicators",
        "pop_t3_population_by_sex_and_age_2022",
        "pop_t3bis_population_by_sex_and_age_2022",
        "pop_t4_previous_residence",
        "pop_g3_previous_residence_by_age",
        "pop_t5_population_by_professional_group",
        "pop_t6_population_by_sex_age_professional_group_2022",
        "emp_t1_population_15_64_by_activity_type",
        "emp_t2_activity_and_employment_by_sex_age_2022",
        "emp_g1_population_15_64_by_activity_type_2022",
        "emp_t3_active_population_by_socio_professional_group",
        "emp_t4_unemployment_census_15_64",
        "emp_g2_unemployment_rate_by_diploma_2022",
        "emp_t5_employment_and_activity",
        "emp_t6_jobs_by_professional_status",
        "emp_t7_jobs_by_socio_professional_group_2022",
        "emp_g3_jobs_by_socio_professional_group",
        "emp_t8_jobs_by_activity_sector",
        "emp_g4_feminization_rate_by_status_and_sector_2022",
    ],
    documents=[
        "act_t1_employment_status_2022: Répartition par statut d'emploi (CHECK IN: 'Ensemble','Salaries','Non-salaries'). Colonnes : employed_count (INT, total des personnes en emploi), percent_total (% de la population totale), percent_part_time (% en temps partiel), percent_women (% de femmes). Une ligne par employment_status pour 2022. Utile pour comparer salariés vs non‑salariés, y compris temps partiel et féminisation.",
        "act_t2_employment_condition_by_sex_2022: Condition d'emploi par sexe en 2022. Clé : employment_condition (CHECK IN: 'Ensemble','Salaries','Titulaires de la fonction publique et contrats a duree indeterminee','Contrats a duree determinee','Interim','Emplois aides','Apprentissage - Stage','Non-Salaries','Independants','Employeurs','Aides familiaux'). Indicateurs : men_count, men_percent, women_count, women_percent. Fournit des effectifs et pourcentages ventilés par sexe pour chaque condition/statut d'emploi.",
        "act_t3_salaries_by_age_and_sex_2022: Salariés par tranche d'âge et sexe. Clé age_group (CHECK IN: 'Ensemble','15-24','25-54','55-64'). Indicateurs : men_count, men_part_time_percent, women_count, women_part_time_percent. Permet de comparer effectifs et part de temps partiel selon l'âge et le sexe en 2022.",
        "act_g1_part_time_share_by_sex: Part du temps partiel (%) parmi les salariés par sexe (2011,2016,2022). Clé : sex (CHECK IN: 'Hommes','Femmes'). Indicateur : part_time_percent. Utile pour analyser les écarts de temps partiel entre hommes et femmes.",
        "act_t4_work_location_2022: Lieu de travail avec séries temporelles. Clé : work_location (CHECK IN: 'Ensemble','Travaillent dans la commune de residence','Travaillent dans une commune autre que la commune de residence'). Valeurs par année : count_2011/2016/2022 et percent_2011/2016/2022. Une ligne par type de lieu ; comparer effectifs et parts au fil du temps.",
        "act_g2_transport_mode_share_2022: Mode de transport utilisé pour se rendre au travail/à l'école (ou trajet principal) en 2022. Clé : transport_mode (CHECK IN: 'Pas de deplacement','Marche a pied (ou rollers, patinette)','Velo (y compris a assistance electrique)','Deux-roues motorise','Voiture, camion ou fourgonnette','Transports en commun'). Indicateur : percent_2022 (part %). Pour le mode le plus utilisé, trier percent_2022 en ordre décroissant.",
        "fam_t1_households_by_composition: Composition des ménages par année. Clé : household_type (CHECK IN: 'Ensemble','Menages d''une personne','Hommes seuls','Femmes seules','Autres menages sans famille','Menages avec famille(s) dont la famille principale est :','Un couple sans enfant','Un couple avec enfant(s)','Une famille monoparentale'). Indicateurs : year_2011/2016/2022 (effectifs et pourcentages) ; plus population_2011/2016/2022 (personnes dans ces ménages). Une ligne par household_type.",
        "fam_g1_household_size_evolution: Taille moyenne des ménages sur longue période. Clé : indicator (valeur fixe 'Nombre moyen d'occupants par residence principale'). Valeurs par année : 1968, 1975, 1982, 1990, 1999, 2006, 2011, 2016, 2022 (DECIMAL). Série temporelle pour étudier l'évolution de l'occupation.",
        "fam_g2_people_living_alone_by_age: Part des personnes vivant seules (%). Clé : age_category (CHECK IN: '15-19','20-24','25-39','40-54','55-64','65-79','80 ans ou plus'). Valeurs : year_2011_percent, year_2016_percent, year_2022_percent. Comparer les taux de solitude selon l'âge et dans le temps.",
        "fam_g3_people_in_couple_by_age: Part des personnes vivant en couple (%). Clé : age_category (mêmes tranches que fam_g2). Valeurs : year_2011_percent, year_2016_percent, year_2022_percent. Suit la prévalence de la vie en couple selon l'âge et dans le temps.",
        "fam_g4_marital_status_2022: Répartition de l'état matrimonial en 2022. Clé : marital_status (CHECK IN: 'Marie(e)','Pacse(e)','En concubinage ou union libre','Veuf, veuve','Divorce(e)','Celibataire'). Indicateur : percent (part des adultes). Une ligne par statut.",
        "fam_t2_households_by_professional_group_2022: Ménages par groupe socio‑professionnel (2022). Clé : group_name (CHECK IN: 'Ensemble','dont agriculteurs exploitants','dont artisans, commercants, chefs d''entreprise','dont cadres et professions intellectuelles superieures','dont professions intermediaires','dont employes','dont ouvriers'). Indicateurs : household_count, household_percent, population_count (personnes dans ces ménages), population_percent. Permet des vues croisées ménages/personnes.",
        "fam_g5_household_distribution_by_professional_group_2022: Distribution des ménages par groupe socio‑professionnel (2022). Clé : group_name (CHECK IN: 'Agriculteurs exploitants','Artisans, commercants, chefs d''entreprise','Cadres et professions intellectuelles superieures','Professions intermediaires','Employes','Ouvriers'). Indicateur : percent (part des ménages). Une ligne par groupe pour une vue de composition normalisée.",
        "fam_t3_family_composition: Familles par family_type sur plusieurs années. Clé : family_type (CHECK IN: 'Ensemble','Couples avec enfant(s)','Familles monoparentales','Hommes seuls avec enfant(s)','Femmes seules avec enfant(s)','Couples sans enfant'). Indicateurs : effectifs et pourcentages pour 2011, 2016, 2022. Comparer les structures familiales dans le temps.",
        "fam_t3bis_couples_with_children_families: Familles de couples avec enfants par sous‑type en 2022. Clé : family_type (CHECK IN: 'Ensemble','Famille traditionnelle','Famille recomposee'). Indicateurs : count_2022, percent_2022. Une ligne par sous‑type.",
        "fam_t4_families_by_number_of_children: Familles selon le nombre d'enfants sur plusieurs années. Clé : children_count_category (aucun, 1, 2, 3+, etc., énuméré dans schema.sql). Indicateurs : effectifs et pourcentages pour 2011/2016/2022. Montre la structure de parité/fécondité des familles.",
        "for_t1_schooling_by_age_and_sex_2022: Scolarisation par âge et sexe (2022). Clé : age_group (CHECK IN: '2 a 5 ans','6 a 10 ans','11 a 14 ans','15 a 17 ans','18 a 24 ans','25 a 29 ans','30 ans ou plus'). Indicateurs : total_population, schooled_population, schooling_rate_total, schooling_rate_male, schooling_rate_female (tous en %). Utilisable pour calculer écarts et couvertures par âge/sexe.",
        "for_g1_school_enrollment_rate_by_age: Taux de scolarisation par tranche d'âge dans le temps. Clé : age_group (CHECK IN: '2 a 5 ans','6 a 10 ans','11 a 14 ans','15 a 17 ans','18 a 24 ans','25 a 29 ans','30 ans ou plus'). Valeurs : rate_2011, rate_2016, rate_2022 (pourcentage). Série temporelle pour analyser la dynamique de scolarisation.",
        "for_t2_highest_diploma_non_schooled_population_by_sex_2022: Plus haut diplôme pour la population non scolarisée (2022). Clé : diploma (CHECK IN: 'Population non scolarisee de 15 ans ou plus','Part des titulaires en %','Aucun diplome ou certificat d''etudes primaires','BEPC, brevet des colleges, DNB','CAP, BEP ou equivalent','Baccalaureat, brevet professionnel ou equivalent','Diplome de l''enseignement superieur de niveau bac + 2','Diplome de l''enseignement superieur de niveau bac + 3 ou bac + 4','Diplome de l''enseignement superieur de niveau bac + 5 ou plus'). Indicateurs : total_population, male_population, female_population (DECIMAL ; effectifs ou % selon le schéma). Ventilation par sexe du niveau de diplôme.",
        "for_g2_highest_diploma_non_schooled_population_percentage: Répartition du plus haut diplôme (population non scolarisée) dans le temps. Clé : diploma (CHECK IN: 'Aucun diplome ou certificat d''etudes primaires','BEPC, brevet des colleges, DNB','CAP, BEP ou equivalent','Baccalaureat, brevet professionnel ou equivalent','Diplome de l''enseignement superieur'). Valeurs : rate_2011, rate_2022 (%). Comparer l'évolution de la structure de diplômés.",
        "log_t1_evolution_of_housing_by_category: Parc de logements par catégorie de 1968 à 2022. Clé : housing_category (CHECK IN: 'Ensemble','Residences principales','Residences secondaires et logements occasionnels','Logements vacants'). Valeurs : year_1968, 1975, 1982, 1990, 1999, 2006, 2011, 2016, 2022 (INT). Évolution de long terme par catégorie.",
        "log_t1bis_housing_categories: Part de chaque catégorie de logement (%). Clé : housing_category. Valeurs : percent_2011, percent_2016, percent_2022. Complément à log_t1 pour l'analyse de composition.",
        "log_t2_types_of_housing: Types de logement avec niveaux et parts par année. Clé : housing_type (CHECK IN: 'Ensemble','Maisons','Appartements','Autres'). Colonnes : number_2011/2016/2022 et percent_2011/2016/2022. Comparer maisons vs appartements.",
        "log_t2bis_contributions_to_change_in_main_residences: Décomposition des évolutions des résidences principales. Clé : contribution_type (CHECK IN: 'Evolution totale','du a l''effet taille des menages','du a l''effet demographique'). Indicateurs : change_2011_2016, percent_2011_2016, change_2016_2022, percent_2016_2022.",
        "log_t3_main_residences_by_number_of_rooms: Répartition des résidences principales par nombre de pièces. Clé : number_of_rooms (CHECK IN: 'Ensemble','1 piece','2 pieces','3 pieces','4 pieces','5 pieces ou plus'). Colonnes : number_2011/2016/2022 et percent_2011/2016/2022.",
        "log_t4_average_number_of_rooms_in_main_residences: Nombre moyen de pièces par residence_type avec séries temporelles. Clé : residence_type (CHECK IN: 'Ensemble des residences principales','Maison','Appartement'). Valeurs : avg_rooms_2011, avg_rooms_2016, avg_rooms_2022 (DECIMAL).",
        "log_t4bis_occupancy_index_of_main_residences: Répartition de l'indice d'occupation/suroccupation. Clé : occupancy_index (CHECK IN: 'Occupation dans la norme','Suroccupation moderee','Suroccupation accentuee','Sous-occupation moderee','Sous-occupation accentuee','Sous-occupation tres accentuee'). Valeurs : percent_2011, percent_2016, percent_2022. Décrit les conditions d'occupation des logements.",
        "log_t5_main_residences_by_completion_period_2022: Résidences principales par période de construction (2022). Clé : completion_period (CHECK IN: 'Residences principales construites avant 2020','Avant 1919','De 1919 a 1945','De 1946 a 1970','De 1971 a 1990','De 1991 a 2005','De 2006 a 2019'). Indicateurs : number (INT), percent (DECIMAL). Une ligne par période pour l'instantané 2022.",
        "log_g1_main_residences_by_type_and_completion_period_2022: Maisons vs appartements par période de construction (2022). Clé : completion_period (CHECK IN: 'Avant 1919','De 1919 a 1945','De 1946 a 1970','De 1971 a 1990','De 1991 a 2005','De 2006 a 2019'). Valeurs : houses (INT), apartments (INT).",
        "log_t6_length_of_stay_in_main_residence_2022: Ancienneté d'occupation des ménages (2022). Clé : stay_length (CHECK IN: 'Ensemble','Depuis moins de 2 ans','De 2 a 4 ans','De 5 a 9 ans','10 ans ou plus'). Indicateurs : households_number, households_percent, households_population, avg_rooms_per_dwelling, avg_rooms_per_person.",
        "log_g2_households_length_of_stay_2022: Part des ménages par ancienneté d'occupation (2022). Clé : stay_length (CHECK IN: 'Depuis moins de 2 ans','De 2 a 4 ans','De 5 a 9 ans','De 10 a 19 ans','De 20 a 29 ans','30 ans ou plus'). Indicateur : households_percent (%).",
        "log_t7_main_residences_by_tenure_status: Statut d'occupation (propriétaire, locataire, etc.) avec niveaux et parts multi‑annuels. Clé : tenure_status (CHECK IN: 'Ensemble','Proprietaire','Locataire','dont d''un logement HLM loue vide','Loge gratuitement'). Colonnes : number_2011/2016/2022, percent_2011/2016/2022, persons_number (INT), avg_stay_years (DECIMAL).",
        "log_t8m_main_residences_heating_fuel: Mix des énergies de chauffage principal avec séries temporelles. Clé : fuel_type (CHECK IN: 'Gaz de ville - reseau de chaleur','Fioul (mazout)','Electricite','Gaz en bouteilles ou en citerne','Autres (bois, solaire, geothermie, etc.)'). Colonnes : number_2011/2016/2022 et percent_2011/2016/2022. Suit la transition énergétique du logement.",
        "log_t9_households_car_ownership: Équipement automobile des ménages avec séries temporelles. Clé : car_equipment (CHECK IN: 'Au moins une voiture','1 voiture','2 voitures ou plus','Aucune voiture'). Colonnes : number_2011/2016/2022 et percent_2011/2016/2022.",
        "pop_t0_population_by_age_group: Population par grands groupes d'âge avec niveaux et parts selon les années. Clé : age_group (CHECK IN: 'Ensemble','0 a 14 ans','15 a 29 ans','30 a 44 ans','45 a 59 ans','60 a 74 ans','75 ans ou plus'). Valeurs : population_2011/2016/2022 et percent_2011/2016/2022.",
        "pop_g2_population_by_age_group: Structure par âge (%) par age_group (CHECK IN: '0 a 14 ans','15 a 29 ans','30 a 44 ans','45 a 59 ans','60 a 74 ans','75 ans ou plus'). Valeurs : percent_2011, percent_2016, percent_2022.",
        "pop_t1_population_history: Indicateurs de long terme (niveau de population ; Densite moyenne (hab/km2)). Clé : indicator (CHECK IN: 'Population','Densite moyenne (hab/km2)'). Valeurs par année : y1968..y2022 (DECIMAL).",
        "pop_t2m_demographic_indicators: Indicateurs démographiques par période. Clé : indicator (CHECK IN: 'Variation annuelle moyenne de la population en %','due au solde naturel en %','due au solde apparent des entrees sorties en %','Taux de natalite (pour mille)','Taux de mortalite (pour mille)'). Colonnes : period_1968_1975, ... , period_2016_2022 (DECIMAL % ou pour mille selon la définition des données).",
        "pop_t3_population_by_sex_and_age_2022: Population par sexe au sein des tranches d'âge (2022). Clé : age_group (CHECK IN: 'Ensemble','0 a 14 ans','15 a 29 ans','30 a 44 ans','45 a 59 ans','60 a 74 ans','75 a 89 ans','90 ans ou plus'). Indicateurs : men, percent_men, women, percent_women. Une ligne par tranche d'âge avec ventilation par sexe.",
        "pop_t3bis_population_by_sex_and_age_2022: Tranches d'âge agrégées par sexe (2022). Clé : age_group (CHECK IN: 'Ensemble','0 a 19 ans','20 a 64 ans','65 ans ou plus'). Indicateurs : men, percent_men, women, percent_women.",
        "pop_t4_previous_residence: Lieu de résidence un an plus tôt avec niveaux et parts par année. Clé : residence_place (CHECK IN: 'Personnes d1 an ou plus habitant auparavant','Dans le meme logement','Dans un autre logement de la meme commune','Dans une autre commune'). Valeurs : population_2011/2016/2022 et percent_2011/2016/2022.",
        "pop_g3_previous_residence_by_age: Parts du lieu de résidence antérieur par tranche d'âge (%, 2022). Clé : age_group (CHECK IN: '1 a 14 ans','15 a 24 ans','25 a 54 ans','55 ans ou plus'). Indicateurs : same_commune_percent, other_commune_percent.",
        "pop_t5_population_by_professional_group: Répartition de la population par groupe socio‑professionnel sur plusieurs années. Clé : socio_professional_group (CHECK IN: 'Ensemble','Agriculteurs exploitants','Artisans, commercants, chefs dentreprise','Cadres et professions intellectuelles superieures','Professions intermediaires','Employes','Ouvriers','Retraites','Autres personnes sans activite professionnelle'). Valeurs : population_2011/2016/2022 et percent_2011/2016/2022.",
        "pop_t6_population_by_sex_age_professional_group_2022: Groupes socio‑professionnels par sexe et âge (2022). Clé : socio_professional_group (CHECK IN: 'Ensemble','Agriculteurs exploitants','Artisans, commercants, chefs dentreprise','Cadres et professions intellectuelles superieures','Professions intermediaires','Employes','Ouvriers','Retraites','Autres personnes sans activite professionnelle'). Indicateurs : men, women, et composition par âge dans le groupe : percent_15_24, percent_25_54, percent_55_plus. Une ligne par groupe CSP.",
        "emp_t1_population_15_64_by_activity_type: Population âgée de 15–64 ans par type d'activité. Clé : activity_type (CHECK IN: 'Ensemble','Actifs en %','Actifs ayant un emploi en %','Chomeurs en %','Inactifs en %','Eleves, etudiants et stagiaires non remuneres en %','Retraites ou preretraites en %','Autres inactifs en %'). Valeurs par année : population_2011, population_2016, population_2022 et percent_2011, percent_2016, percent_2022. Une ligne par activity_type ; comparer niveaux et parts dans le temps.",
        "emp_t2_activity_and_employment_by_sex_age_2022: Indicateurs d'activité et d'emploi par sexe et âge (2022). Clé : categorie (CHECK IN: 'Ensemble','15 a 24 ans','25 a 54 ans','55 a 64 ans','Hommes','Hommes 15 a 24 ans','Hommes 25 a 54 ans','Hommes 55 a 64 ans','Femmes','Femmes 15 a 24 ans','Femmes 25 a 54 ans','Femmes 55 a 64 ans'). Indicateurs par sexe : activity_rate_men, employment_rate_men, unemployment_rate_men, activity_rate_women, employment_rate_women, unemployment_rate_women (tous en %). Permet l'analyse des écarts de genre par âge en 2022.",
        "emp_g1_population_15_64_by_activity_type_2022: Part de la population 15–64 par type d'activité (2022). Clé : categorie (CHECK IN: 'Actifs ayant un emploi','Chomeurs','Retraites','Eleves, etudiants et stagiaires non remuneres','Autres inactifs'). Indicateur : percent_2022 (part %). Une ligne par categorie ; classer par percent_2022 pour voir la plus grande catégorie.",
        "emp_t3_active_population_by_socio_professional_group: Population active (15–64) par groupe socio‑professionnel sur plusieurs années. Clé : groupe_socio (CHECK IN: 'Ensemble','Agriculteurs exploitants','Artisans, commercants, chefs d''entreprise','Cadres et professions intellectuelles superieures','Professions intermediaires','Employes','Ouvriers'). Valeurs : number_2011/2016/2022 et percent_2011/2016/2022. Suit l'évolution de la composition CSP parmi les actifs.",
        "emp_t4_unemployment_census_15_64: Chômage (définition recensement) pour les 15–64 ans, avec niveaux et taux par année. Clé : indicateur (CHECK IN: 'Nombre de chomeurs','Taux de chomage en %','Taux de chomage des 15 a 24 ans','Taux de chomage des 25 a 54 ans','Taux de chomage des 55 a 64 ans'). Valeurs : 2011/2016/2022 (effectifs et/ou % selon définition). À utiliser avec emp_g2 pour le chômage par diplôme.",
        "emp_g2_unemployment_rate_by_diploma_2022: Taux de chômage (%) par plus haut diplôme chez les 15–64 ans (2022). Clé : diplome (CHECK IN: 'Aucun diplome ou certificat d''etudes primaires','BEPC, brevet des colleges, DNB','CAP, BEP ou equivalent','Baccalaureat, brevet professionnel ou equivalent','Diplome de l''enseignement superieur de niveau bac + 2','Diplome de l''enseignement superieur de niveau bac + 3 ou bac + 4','Diplome de l''enseignement superieur de niveau bac + 5 ou plus'). Indicateur : unemployment_rate_percent_2022. Une ligne par niveau de diplôme pour comparer les risques selon l'attainment.",
        "emp_t5_employment_and_activity: Indicateurs phares pour les 15–64 ans sur plusieurs années. Clé : indicateur (CHECK IN: 'Nombre d''emplois dans la zone','Actifs ayant un emploi residant dans la zone','Indicateur de concentration d''emploi','Taux d''activite parmi les 15 ans ou plus en %'). Valeurs : value_2011, value_2016, value_2022 (pourcentage). Série temporelle des principaux taux.",
        "emp_t6_jobs_by_professional_status: Emplois par statut professionnel avec sous‑totaux. Remarque : libellés contenant des doublons ('dont femmes', 'dont temps partiel') ; pas de UNIQUE/PK sur la première colonne ; l'ordre des lignes encode la hiérarchie. Colonnes typiques : number_2011/2016/2022 et percent_2011/2016/2022. Clé : status_label (texte libre selon le schéma).",
        "emp_t7_jobs_by_socio_professional_group_2022: Emplois par groupe socio‑professionnel (CSP) en 2022. Clé : socio_professional_group (énumération du schéma). Indicateurs : jobs_number_2022 et jobs_percent_2022. Instantané de la structure de l'emploi par CSP.",
        "emp_g3_jobs_by_socio_professional_group: Distribution des emplois par groupe socio‑professionnel dans le temps. Clé : socio_professional_group. Valeurs : percent_2011, percent_2016, percent_2022. Comparer les évolutions structurelles de l'emploi par CSP.",
        "emp_t8_jobs_by_activity_sector: Emplois par secteur d'activité (industrie/services/etc.) sur plusieurs années. Clé : secteur_activite (CHECK IN: 'Ensemble','Agriculture','Industrie','Construction','Commerce, transports, services divers','Administration publique, enseignement, sante, action sociale'). Valeurs : number_2011/2016/2022 et percent_2011/2016/2022. Pour étudier les changements sectoriels de l'emploi.",
        "emp_g4_feminization_rate_by_status_and_sector_2022: Taux de féminisation (%) des emplois par statut professionnel et secteur d'activité (2022). Clé : secteur (CHECK IN: 'Agriculture','Industrie','Construction','Commerce, transports, services divers','Administration publique, enseignement, sante, action sociale'). Indicateurs: salaries_pct, non_salaries_pct (taux de féminisation par statut).",
    ],
)


# question = "Quel est le mode de transport le plus utilisé en 2022 ?"
# question = "Quel est le taux de chomage des personnes sans diplôme en 2022 ?"
# question = (
#     "Quelle est la répartition des ménages par groupe socio‑professionnel en 2022 entre Nice et Cannes ?"
# )

question = "Fait moi un synthèse de la situation économique et sociale de la commune de Antibes en 2022."


# Nombre maximal de communes à considérer lorsque la question cite plusieurs villes
MAX_COMMUNES = 5


communes = [
    {"name": "Département", "code": "06000"},
    {"name": "Aiglun", "code": "06001"},
    {"name": "Amirat", "code": "06002"},
    {"name": "Andon", "code": "06003"},
    {"name": "Antibes", "code": "06004"},
    {"name": "Ascros", "code": "06005"},
    {"name": "Aspremont", "code": "06006"},
    {"name": "Auribeau-sur-Siagne", "code": "06007"},
    {"name": "Auvare", "code": "06008"},
    {"name": "Bairols", "code": "06009"},
    {"name": "Le Bar-sur-Loup", "code": "06010"},
    {"name": "Beaulieu-sur-Mer", "code": "06011"},
    {"name": "Beausoleil", "code": "06012"},
    {"name": "Belvédère", "code": "06013"},
    {"name": "Bendejun", "code": "06014"},
    {"name": "Berre-les-Alpes", "code": "06015"},
    {"name": "Beuil", "code": "06016"},
    {"name": "Bézaudun-les-Alpes", "code": "06017"},
    {"name": "Biot", "code": "06018"},
    {"name": "Blausasc", "code": "06019"},
    {"name": "La Bollène-Vésubie", "code": "06020"},
    {"name": "Bonson", "code": "06021"},
    {"name": "Bouyon", "code": "06022"},
    {"name": "Breil-sur-Roya", "code": "06023"},
    {"name": "Briançonnet", "code": "06024"},
    {"name": "Le Broc", "code": "06025"},
    {"name": "Cabris", "code": "06026"},
    {"name": "Cagnes-sur-Mer", "code": "06027"},
    {"name": "Caille", "code": "06028"},
    {"name": "Cannes", "code": "06029"},
    {"name": "Le Cannet", "code": "06030"},
    {"name": "Cantaron", "code": "06031"},
    {"name": "Cap-d'Ail", "code": "06032"},
    {"name": "Carros", "code": "06033"},
    {"name": "Castagniers", "code": "06034"},
    {"name": "Castellar", "code": "06035"},
    {"name": "Castillon", "code": "06036"},
    {"name": "Caussols", "code": "06037"},
    {"name": "Châteauneuf-Grasse", "code": "06038"},
    {"name": "Châteauneuf-Villevieille", "code": "06039"},
    {"name": "Châteauneuf-d'Entraunes", "code": "06040"},
    {"name": "Cipières", "code": "06041"},
    {"name": "Clans", "code": "06042"},
    {"name": "Coaraze", "code": "06043"},
    {"name": "La Colle-sur-Loup", "code": "06044"},
    {"name": "Collongues", "code": "06045"},
    {"name": "Colomars", "code": "06046"},
    {"name": "Conségudes", "code": "06047"},
    {"name": "Contes", "code": "06048"},
    {"name": "Courmes", "code": "06049"},
    {"name": "Coursegoules", "code": "06050"},
    {"name": "La Croix-sur-Roudoule", "code": "06051"},
    {"name": "Cuébris", "code": "06052"},
    {"name": "Daluis", "code": "06053"},
    {"name": "Drap", "code": "06054"},
    {"name": "Duranus", "code": "06055"},
    {"name": "Entraunes", "code": "06056"},
    {"name": "L'Escarène", "code": "06057"},
    {"name": "Escragnolles", "code": "06058"},
    {"name": "Èze", "code": "06059"},
    {"name": "Falicon", "code": "06060"},
    {"name": "Les Ferres", "code": "06061"},
    {"name": "Fontan", "code": "06062"},
    {"name": "Gars", "code": "06063"},
    {"name": "Gattières", "code": "06064"},
    {"name": "La Gaude", "code": "06065"},
    {"name": "Gilette", "code": "06066"},
    {"name": "Gorbio", "code": "06067"},
    {"name": "Gourdon", "code": "06068"},
    {"name": "Grasse", "code": "06069"},
    {"name": "Gréolières", "code": "06070"},
    {"name": "Guillaumes", "code": "06071"},
    {"name": "Ilonse", "code": "06072"},
    {"name": "Isola", "code": "06073"},
    {"name": "Lantosque", "code": "06074"},
    {"name": "Levens", "code": "06075"},
    {"name": "Lieuche", "code": "06076"},
    {"name": "Lucéram", "code": "06077"},
    {"name": "Malaussène", "code": "06078"},
    {"name": "Mandelieu-la-Napoule", "code": "06079"},
    {"name": "Marie", "code": "06080"},
    {"name": "Le Mas", "code": "06081"},
    {"name": "Massoins", "code": "06082"},
    {"name": "Menton", "code": "06083"},
    {"name": "Mouans-Sartoux", "code": "06084"},
    {"name": "Mougins", "code": "06085"},
    {"name": "Moulinet", "code": "06086"},
    {"name": "Les Mujouls", "code": "06087"},
    {"name": "Nice", "code": "06088"},
    {"name": "Opio", "code": "06089"},
    {"name": "Pégomas", "code": "06090"},
    {"name": "Peille", "code": "06091"},
    {"name": "Peillon", "code": "06092"},
    {"name": "La Penne", "code": "06093"},
    {"name": "Péone", "code": "06094"},
    {"name": "Peymeinade", "code": "06095"},
    {"name": "Pierlas", "code": "06096"},
    {"name": "Pierrefeu", "code": "06097"},
    {"name": "Puget-Rostang", "code": "06098"},
    {"name": "Puget-Théniers", "code": "06099"},
    {"name": "Revest-les-Roches", "code": "06100"},
    {"name": "Rigaud", "code": "06101"},
    {"name": "Rimplas", "code": "06102"},
    {"name": "Roquebillière", "code": "06103"},
    {"name": "Roquebrune-Cap-Martin", "code": "06104"},
    {"name": "Roquefort-les-Pins", "code": "06105"},
    {"name": "Roquestéron", "code": "06106"},
    {"name": "La Roque-en-Provence", "code": "06107"},
    {"name": "La Roquette-sur-Siagne", "code": "06108"},
    {"name": "La Roquette-sur-Var", "code": "06109"},
    {"name": "Roubion", "code": "06110"},
    {"name": "Roure", "code": "06111"},
    {"name": "Le Rouret", "code": "06112"},
    {"name": "Sainte-Agnès", "code": "06113"},
    {"name": "Saint-André-de-la-Roche", "code": "06114"},
    {"name": "Saint-Antonin", "code": "06115"},
    {"name": "Saint-Auban", "code": "06116"},
    {"name": "Saint-Blaise", "code": "06117"},
    {"name": "Saint-Cézaire-sur-Siagne", "code": "06118"},
    {"name": "Saint-Dalmas-le-Selvage", "code": "06119"},
    {"name": "Saint-Étienne-de-Tinée", "code": "06120"},
    {"name": "Saint-Jean-Cap-Ferrat", "code": "06121"},
    {"name": "Saint-Jeannet", "code": "06122"},
    {"name": "Saint-Laurent-du-Var", "code": "06123"},
    {"name": "Saint-Léger", "code": "06124"},
    {"name": "Saint-Martin-d'Entraunes", "code": "06125"},
    {"name": "Saint-Martin-du-Var", "code": "06126"},
    {"name": "Saint-Martin-Vésubie", "code": "06127"},
    {"name": "Saint-Paul-de-Vence", "code": "06128"},
    {"name": "Saint-Sauveur-sur-Tinée", "code": "06129"},
    {"name": "Saint-Vallier-de-Thiey", "code": "06130"},
    {"name": "Sallagriffon", "code": "06131"},
    {"name": "Saorge", "code": "06132"},
    {"name": "Sauze", "code": "06133"},
    {"name": "Séranon", "code": "06134"},
    {"name": "Sigale", "code": "06135"},
    {"name": "Sospel", "code": "06136"},
    {"name": "Spéracèdes", "code": "06137"},
    {"name": "Théoule-sur-Mer", "code": "06138"},
    {"name": "Thiéry", "code": "06139"},
    {"name": "Le Tignet", "code": "06140"},
    {"name": "Toudon", "code": "06141"},
    {"name": "Touët-de-l'Escarène", "code": "06142"},
    {"name": "Touët-sur-Var", "code": "06143"},
    {"name": "La Tour", "code": "06144"},
    {"name": "Tourette-du-Château", "code": "06145"},
    {"name": "Tournefort", "code": "06146"},
    {"name": "Tourrette-Levens", "code": "06147"},
    {"name": "Tourrettes-sur-Loup", "code": "06148"},
    {"name": "La Trinité", "code": "06149"},
    {"name": "La Turbie", "code": "06150"},
    {"name": "Utelle", "code": "06151"},
    {"name": "Valbonne", "code": "06152"},
    {"name": "Valdeblore", "code": "06153"},
    {"name": "Valderoure", "code": "06154"},
    {"name": "Vallauris", "code": "06155"},
    {"name": "Venanson", "code": "06156"},
    {"name": "Vence", "code": "06157"},
    {"name": "Villars-sur-Var", "code": "06158"},
    {"name": "Villefranche-sur-Mer", "code": "06159"},
    {"name": "Villeneuve-d'Entraunes", "code": "06160"},
    {"name": "Villeneuve-Loubet", "code": "06161"},
    {"name": "La Brigue", "code": "06162"},
    {"name": "Tende", "code": "06163"},
]


def _log_step(message: str) -> None:
    """Print a concise, timestamped log line for each pipeline step."""
    try:
        ts = datetime.now().strftime("%H:%M:%S")
    except Exception:
        ts = "--:--:--"
    print(f"[{ts}] {message}")

def get_table_def(table_name):
    pattern = re.compile(
        rf"CREATE\s+TABLE\s+['\"]?{re.escape(table_name)}['\"]?", re.IGNORECASE
    )

    with open("./data/dumps/schema.sql", "r", encoding="utf-8") as f:
        content = f.read()

    if pattern.search(content):
        match = re.search(
            rf"CREATE\s+TABLE\s+['\"]?{re.escape(table_name)}['\"]?.*?\);",
            content,
            flags=re.IGNORECASE | re.DOTALL,
        )
        if match:
            return match.group(0)
    else:
        return ""
    return ""



def reformuler_question(original_question: str, ddl_subset: str) -> str:
    """Use Google (Gemini) to refine/clarify the user's question for SQL generation.
    Returns a concise refined question in the same language as input.
    """
    prompt = f"""
    Tu es un assistant qui reformule la question utilisateur pour générer une requête SQL précise.
    Objectifs:
    - Clarifier l'intention (métrique, dimension, filtre, tri).
    - Rester dans la même langue que la question originale.
    - Être concis et non-ambigu.
    - Ne PAS produire de SQL ici.

    Contexte de schéma (extrait ciblé):
    {ddl_subset}

    Question originale: {original_question}

    Réponds uniquement par la question reformulée, sans explication.
    """
    try:
        res = google_llm.invoke(prompt)
        if isinstance(res, str):
            return res.strip()
        if hasattr(res, "content") and isinstance(res.content, str):
            return res.content.strip()
    except Exception:
        pass
    # Fallback to original if anything goes wrong
    return original_question


def extract_sql(text: str) -> str:
    """Extract SQL code from a model response.
    Supports ```sql fences or plain text; strips trailing code fences and explanations.
    """
    if not text:
        return ""
    # Try fenced block first
    m = re.search(r"```sql\s*([\s\S]*?)```", text, re.IGNORECASE)
    if m:
        return m.group(1).strip().rstrip(";")
    # Try until first semicoln if present
    # But some prompts forbid semicolons; just return the text as-is trimmed
    return text.strip().strip("`").rstrip(";")


def extract_chart_from_text(text: str) -> dict | None:
    """Extract a JSON chart block from model output inside ```chart ... ``` fences.
    Returns a parsed dict or None if not found/parsable.
    """
    if not text:
        return None
    m = re.search(r"```chart\s*([\s\S]*?)```", text, re.IGNORECASE)
    if not m:
        return None
    inner = m.group(1).strip()
    # Try to parse inner as JSON; be forgiving for trailing commas or markdown
    try:
        return json.loads(inner)
    except Exception:
        # Try to extract a JSON object within the inner text
        jmatch = re.search(r"(\{[\s\S]*\})", inner)
        if jmatch:
            try:
                return json.loads(jmatch.group(1))
            except Exception:
                return None
    return None



def prompt_with_df(question_text: str, df: pd.DataFrame) -> tuple[str | None, dict | None]:
    """Envoie un prompt concis à Google en se basant uniquement sur le DataFrame résultat.

    Returns a tuple (response_text_or_None, chart_dict_or_None).
    """
    if df is None or df.empty:
        print(
            "Aucune donnée retournée par la requête SQL. Impossible de formuler une réponse basée sur les données."
        )
        return None, None

    try:
        data_json = df.to_json(orient="records", force_ascii=False)
    except Exception:
        data_json = df.to_csv(index=False)

    # Limiter la taille dans le prompt
    max_len = 12000
    if len(data_json) > max_len:
        data_json = data_json[:max_len] + "\n... (truncated)"

    followup_prompt = f"""
    Tu es un analyste de données. Réponds à la question ci-dessous en te basant UNIQUEMENT sur les données fournies.
    - Réponse courte et directe en français.
    - Indique l'unité (%, nombre) si visible dans les colonnes.
    - Si plusieurs communes sont présentes, compare-les explicitement. Les colonnes 'commune_code' et 'commune_name' identifient la source.
    - Si plusieurs lignes sont pertinentes, propose une synthèse claire.
        - Si la question demande explicitement un graphique, OU si un graphique rend la compréhension plus claire, propose un graphique.
            - Fournis un bloc JSON dans des balises ```chart ... ``` APRÈS la réponse textuelle.
            - Respecte strictement les noms de colonnes existants; n'invente pas de colonnes.
            - Choisis un type parmi: bar, line, pie, area, radar, radial.
            - Structure attendue du bloc:
                        ```chart
                        {{
                            "type": "bar|line|pie|area|radar|radial",
                            "data": [ ... ],
                            "title": "<titre court>",
                            "description": "<pourquoi ce graphique est pertinent en une phrase>"
                        }}
                        ```

    Question: {question_text}

    Données (JSON):
    {data_json}
    """

    try:
        ans = google_llm.invoke(followup_prompt)
        output = ans if isinstance(ans, str) else getattr(ans, "content", str(ans))
        output_str = str(output)
        print("\nRéponse basée sur les données (Google):")
        print(output_str)
        chart = extract_chart_from_text(output_str)
        # Remove the chart block from the returned text so callers receive a clean answer
        output_no_chart = re.sub(r"```chart\s*([\s\S]*?)```", "", output_str, flags=re.IGNORECASE).strip()
        return output_no_chart, chart
    except Exception as e:
        print("Erreur lors de l'appel Google pour l'analyse des données:", e)
        return None, None


def build_sql_fix_prompt(question_text: str, ddl_subset: str, sql_text: str, error_message: str | None) -> str:
    """Return a concise prompt to help an LLM or a human fix the SQL without changing its core intent."""
    err = error_message or ""
    return (
        "Tu es un expert SQL sur SQLite.\n"
        "Objectif: corriger MINIMALEMENT la requête pour qu'elle s'exécute, sans changer son intention ni sa logique centrale.\n"
        "Règles:\n"
        "- Ne pas introduire d'agrégations interdites (p.ex. COUNT, SUM) s'il n'y en a pas.\n"
        "- Respecter les noms de tables/colonnes du DDL fourni.\n"
        "- Adapter la syntaxe au dialecte SQLite.\n"
        "- Répondre uniquement par le SQL corrigé entre balises ```sql ... ```.\n\n"
        f"Question: {question_text}\n\n"
        f"Erreur: {err}\n\n"
        "DDL (extrait):\n"
        f"{ddl_subset}\n\n"
        "Requête à corriger:\n"
        f"```sql\n{sql_text}\n```\n"
    )


def try_fix_sql_via_google(question_text: str, ddl_subset: str, sql_text: str, error_message: str | None) -> str:
    """Ask Google to minimally fix the SQL. Returns a new SQL or empty string on failure."""
    prompt = build_sql_fix_prompt(question_text, ddl_subset, sql_text, error_message)
    try:
        res = google_llm.invoke(prompt)
        content = res if isinstance(res, str) else getattr(res, "content", str(res))
        fixed = extract_sql(str(content))
        return fixed.strip()
    except Exception as _:
        return ""


def _build_communes_catalog_formats(communes_catalog: list[dict]) -> tuple[str, str]:
    """Retourne (table_markdown, json_array_str) avec code et name.
    - table_markdown: format lisible par humain, colonnes | code | name |
    - json_array_str: JSON strict pour usage par le LLM
    """
    # Markdown table
    rows = ["| code | name |", "|------|------|"]
    for c in communes_catalog:
        code = c.get("code", "?")
        name = c.get("name", "?")
        rows.append(f"| {code} | {name} |")
    table_md = "\n".join(rows)

    # JSON array with only needed fields
    compact = [{"code": c.get("code"), "name": c.get("name")} for c in communes_catalog]
    json_str = json.dumps(compact, ensure_ascii=False)
    return table_md, json_str


def ask_google_for_commune_codes(
    question_text: str, communes_catalog: list[dict], max_communes: int | None = None
) -> list[str]:
    """Interroge Google pour déterminer les codes communes pertinents.
    - Retourne ["06000"] si la question concerne tout le département / toutes les communes / périmètre non précisé.
    - Sinon retourne la liste des codes INSEE (06xxx) présents dans le catalogue fourni.
    - Respecte un maximum de communes si max_communes est fourni.
    Réponse attendue STRICTEMENT au format JSON: {"codes": ["06000", "06088", ...]}
    """
    _log_step("[Codes] Résolution du périmètre géographique en cours…")
    try:
        # Construire deux formats de catalogue: table Markdown et JSON compact
        table_catalog, json_catalog = _build_communes_catalog_formats(communes_catalog)

        prompt = f"""
Tu es un extracteur de périmètre géographique pour des données du département 06 (Alpes-Maritimes).
On te fournit un catalogue de communes au format TABLE et JSON ci-dessous. Les bases SQLite existent par commune (06xxx) et une base départementale 06000 pour l'ensemble.

Règles de décision:
- Si la question concerne le département, toutes les communes, ou ne précise aucune commune, réponds uniquement avec ["06000"].
- Si la question cite explicitement une ou plusieurs communes, renvoie uniquement les codes correspondants trouvés dans le catalogue.
- Si tu as un doute, privilégie ["06000"].
 - Respecte un maximum de {max_communes if max_communes is not None else 'N'} communes si plusiers villes sont citées; choisis les plus pertinentes.
 - Ne crée pas de codes non présents dans le catalogue. Ne mélange pas 06000 avec des communes spécifiques: si des communes spécifiques sont choisies, n'inclus pas 06000.

Réponds STRICTEMENT en JSON SANS texte additionnel au format exact: {{"codes": ["06000", "06xyz", ...]}}.

Question: {question_text}
Catalogue (TABLE):
{table_catalog}

Catalogue (JSON):
{json_catalog}
"""
        res = google_llm.invoke(prompt)
        raw = res if isinstance(res, str) else getattr(res, "content", str(res))
        # Tenter un parse JSON direct
        try:
            data = json.loads(raw)
            codes = data.get("codes") if isinstance(data, dict) else None
            if isinstance(codes, list) and all(isinstance(x, str) for x in codes):
                parsed_codes = codes
            else:
                parsed_codes = None
        except Exception:
            parsed_codes = None
        # Extraction par regex d'un bloc JSON minimal
        if parsed_codes is None:
            m = re.search(r"\{\s*\"codes\"\s*:\s*\[(.*?)\]\s*\}", str(raw), re.S)
            if m:
                inner = m.group(1)
                items = re.findall(r"\"(06\d{3})\"", inner)
                if items:
                    parsed_codes = items

        # Nettoyage, validation contre le catalogue et déduplication en conservant l'ordre
        if parsed_codes is not None:
            allowed = {c.get("code") for c in communes_catalog if isinstance(c, dict)}
            cleaned: list[str] = []
            seen = set()
            for code in parsed_codes:
                if not isinstance(code, str):
                    continue
                if not re.match(r"^06\d{3}$", code):
                    continue
                if code not in allowed:
                    continue
                if code in seen:
                    continue
                seen.add(code)
                cleaned.append(code)

            # Si des communes spécifiques sont présentes, retirer 06000 pour éviter doublon de périmètre
            if any(c != "06000" for c in cleaned) and "06000" in cleaned:
                cleaned = [c for c in cleaned if c != "06000"]

            # Appliquer le maximum si défini
            if max_communes is not None and len(cleaned) > max_communes:
                print(
                    f"Le modèle a renvoyé {len(cleaned)} codes; limitation au maximum demandé ({max_communes})."
                )
                cleaned = cleaned[:max_communes]

            if cleaned:
                _log_step(f"[Codes] Codes retenus: {', '.join(cleaned)}")
                return cleaned
    except Exception as e:
        print("Erreur pendant la résolution des communes:", e)
    # Secours: département complet
    _log_step("[Codes] Aucun code exploitable renvoyé, bascule sur ['06000']")
    return ["06000"]


def select_db_path_from_codes(codes: list[str]) -> str | None:
    """Choisit le chemin SQLite à partir d'une liste de codes.
    - Priorité à 06000 si présent et existe.
    - Sinon, premier code ayant une base existante.
    - Retourne None si aucune base trouvée.
    """
    try:
        base_dir = "./data/csv"
        # Priorité département
        if "06000" in codes:
            path = os.path.join(base_dir, "06000", "06000.db")
            if os.path.exists(path):
                return path
        # Sinon la première existante
        for code in codes:
            if not re.match(r"^06\d{3}$", code):
                continue
            path = os.path.join(base_dir, code, f"{code}.db")
            if os.path.exists(path):
                return path
    except Exception:
        pass
    return None


def run_legacy_cli() -> None:
    """Ancienne exécution directe via `python main.py` encapsulée dans une fonction dédiée."""
    print("Ragging the database schema for question:", question)
    results = collection.query(query_texts=[question], n_results=5)
    print(results.get("ids"))

    # Construire le sous-ensemble de DDL
    ddl_statements = ""
    for table_names in results.get("ids", []):
        for table_name in table_names:
            table_def = get_table_def(table_name)
            ddl_statements += (table_def or "") + "\n"

    # Générer le SQL
    prompt = f"""
### Task
Generate a SQL query to answer [QUESTION]{question}[/QUESTION]
Never use COUNT or SUM functions in your query.
When a CHECK IN constraint is defined on a column, you will have one row per value of the constraint.

### Database Schema
The query will run on a database with the following schema:
{ddl_statements}

### Answer
Given the database schema, here is the SQL query that [QUESTION]{question}[/QUESTION]
[SQL]
"""
    res = google_llm.invoke(prompt)
    sql_req = ""
    if hasattr(res, "content") and isinstance(res.content, str):
        m = re.search(r"```sql([^`;]+)(?:```|;)", res.content)
        if m:
            sql_req = m.group(1)
            print("Extracted SQL Query:", sql_req)

    # Exécuter la requête SQL si disponible, puis envoyer un prompt avec les données
    if not sql_req:
        print("Aucun SQL généré, arrêt.")
        return

    # Étape 0: résolution du périmètre géographique
    selected_codes = ask_google_for_commune_codes(question, communes, MAX_COMMUNES)
    print("Codes communes retenus:", selected_codes)
    code_to_name = {c.get("code"): c.get("name") for c in communes if isinstance(c, dict)}

    # Chercher une base pour chaque code sélectionné
    base_dir = "./data/csv"
    code_db_pairs: list[tuple[str, str]] = []
    for code in selected_codes:
        if not isinstance(code, str) or not re.match(r"^06\d{3}$", code):
            continue
        candidate = os.path.join(base_dir, code, f"{code}.db")
        if os.path.exists(candidate):
            code_db_pairs.append((code, candidate))

    # Fallback si rien trouvé
    if not code_db_pairs:
        for fallback in [
            ("06000", os.path.join(base_dir, "06000", "06000.db")),
            ("06088", os.path.join(base_dir, "06088", "06088.db")),
        ]:
            if os.path.exists(fallback[1]):
                code_db_pairs.append(fallback)
                print("Aucun DB correspondant aux codes. Bascule vers:", fallback[1])
                break

    if not code_db_pairs:
        print("Aucune base SQLite trouvée. Étape d'analyse basée sur les données ignorée.")
        return

    try:
        dfs: list[pd.DataFrame] = []
        for code, db_path in code_db_pairs:
            try:
                print("Exécution SQL pour", code, "via", db_path)
                with sqlite3.connect(db_path) as conn:
                    df_part = pd.read_sql_query(sql_req, conn)
                # Annoter la source
                df_part.insert(0, "commune_code", code)
                df_part.insert(1, "commune_name", code_to_name.get(code, code))
                dfs.append(df_part)
            except Exception as e:
                print(f"Erreur pour {code} ({db_path}):", e)
        if not dfs:
            print("Aucune donnée retournée pour les bases sélectionnées.")
            return
        df_all = pd.concat(dfs, ignore_index=True, sort=False)
        with pd.option_context(
            "display.max_rows", 20, "display.max_columns", None, "display.width", 160
        ):
            print("\nAperçu du résultat SQL (fusionné):")
            print(df_all.head(20))
        prompt_with_df(question, df_all)
    except Exception as e:
        print("Erreur lors de l'exécution SQL/chargement DataFrame:", e)


if __name__ == "__main__":
    # Exécution mode script (ancienne méthode) encapsulée
    run_legacy_cli()


# -------------------- API: FastAPI endpoint --------------------
app = FastAPI(title="AI Service API")


class AskRequest(BaseModel):
    query: str
    maxCommunes: Optional[int] = None
    codes: Optional[List[str]] = None
    legendType: Optional[str] = None


def _pipeline_internal(question_text: str, max_communes: Optional[int], override_codes: Optional[List[str]]):
    # 1) RAG: récupérer DDL cible
    _log_step(f"[Pipeline] START – question: {question_text}")
    _log_step("[RAG] Recherche des tables pertinentes…")
    try:
        results = collection.query(query_texts=[question_text], n_results=5)
        _log_step(f"[RAG] Candidats tables: {sum(len(x) for x in results.get('ids', []))}")
        ddl_statements = ""
        for table_names in results.get("ids", []):
            for table_name in table_names:
                table_def = get_table_def(table_name)
                ddl_statements += (table_def or "") + "\n"
    except Exception as e:
        _log_step(f"[RAG] Echec: {e}")
        return {
            "success": False,
            "query": question_text,
            "answer": "",
            "error": f"rag_failed: {e}",
            "sqlQuery": "",
            "selected_codes": [],
            "model": "gemini-2.5-flash",
            "source": "sqlite",
            "chart": {"type": "bar", "data": []},
        }

    # 2) Génération SQL via Google
    prompt = f"""
### Task
Generate a SQL query to answer [QUESTION]{question_text}[/QUESTION]
Never use COUNT or SUM functions in your query.
When a CHECK IN constraint is defined on a column, you will have one row per value of the constraint.

### Database Schema
The query will run on a database with the following schema:
{ddl_statements}

### Answer
Given the database schema, here is the SQL query that [QUESTION]{question_text}[/QUESTION]
[SQL]
"""
    _log_step("[SQL] Génération de la requête via Google…")
    try:
        res = google_llm.invoke(prompt)
        sql_req = ""
        if hasattr(res, "content") and isinstance(res.content, str):
            m = re.search(r"```sql([^`;]+)(?:```|;)", res.content)
            if m:
                sql_req = m.group(1)
    except Exception as e:
        sql_req = ""
    if not sql_req:
        _log_step("[SQL] Aucune requête SQL générée")
        return {
            "success": False,
            "query": question_text,
            "answer": "",
            "error": "no_sql_generated",
            "sqlQuery": "",
            "selected_codes": [],
            "model": "gemini-2.5-flash",
            "source": "sqlite",
            "chart": {"type": "bar", "data": []},
        }

    # 3) Résolution communes
    if override_codes:
        selected_codes = [c for c in override_codes if isinstance(c, str)]
        _log_step(f"[Codes] Codes fournis par l'appel: {', '.join(selected_codes) if selected_codes else '—'}")
    else:
        selected_codes = ask_google_for_commune_codes(question_text, communes, max_communes)
        _log_step(f"[Codes] Codes sélectionnés: {', '.join(selected_codes) if selected_codes else '—'}")

    # 4) Exécution multi-DB et fusion
    code_to_name = {c.get("code"): c.get("name") for c in communes if isinstance(c, dict)}
    base_dir = "./data/csv"
    code_db_pairs: List[tuple[str, str]] = []
    for code in selected_codes:
        if not isinstance(code, str) or not re.match(r"^06\d{3}$", code):
            continue
        path = os.path.join(base_dir, code, f"{code}.db")
        if os.path.exists(path):
            code_db_pairs.append((code, path))
    if not code_db_pairs:
        for fallback in [
            ("06000", os.path.join(base_dir, "06000", "06000.db")),
            ("06088", os.path.join(base_dir, "06088", "06088.db")),
        ]:
            if os.path.exists(fallback[1]):
                code_db_pairs.append(fallback)
                break
    if not code_db_pairs:
        _log_step("[DB] Aucune base SQLite trouvée pour les codes sélectionnés")
        return {
            "success": False,
            "query": question_text,
            "answer": "",
            "error": "no_database_found",
            "sqlQuery": sql_req,
            "selected_codes": selected_codes,
            "model": "gemini-2.5-flash",
            "source": "sqlite",
            "chart": {"type": "bar", "data": []},
        }

    _log_step(f"[DB] Bases à interroger: {len(code_db_pairs)}")
    dfs: List[pd.DataFrame] = []
    first_error: str | None = None
    current_sql = sql_req
    attempted_retry = False
    retry_succeeded = False

    def _run_once(sql_to_run: str) -> tuple[list[pd.DataFrame], str | None]:
        tmp_dfs: list[pd.DataFrame] = []
        local_err: str | None = None
        for code, dbp in code_db_pairs:
            try:
                _log_step(f"[SQL] Exécution sur {code} ({os.path.basename(dbp)})")
                with sqlite3.connect(dbp) as conn:
                    dfp = pd.read_sql_query(sql_to_run, conn)
                dfp.insert(0, "commune_code", code)
                dfp.insert(1, "commune_name", code_to_name.get(code, code))
                tmp_dfs.append(dfp)
            except Exception as e:
                msg = str(e)
                print(f"Erreur pour {code} ({dbp}):", msg)
                if local_err is None:
                    local_err = msg
        return tmp_dfs, local_err

    # First attempt with original SQL
    dfs, first_error = _run_once(current_sql)

    # One-time retry on SQL execution failure
    if not dfs and first_error:
        _log_step("[Retry] Echec d'exécution SQL – tentative de correction minimale…")
        attempted_retry = True
        fixed_sql = try_fix_sql_via_google(question_text, ddl_statements, current_sql, first_error)
        if fixed_sql:
            _log_step("[Retry] SQL corrigé par LLM – nouvelle tentative…")
            current_sql = fixed_sql
            dfs, second_error = _run_once(current_sql)
            retry_succeeded = len(dfs) > 0
            if not retry_succeeded:
                first_error = second_error or first_error
        else:
            _log_step("[Retry] Impossible d'obtenir une correction SQL")

    if not dfs:
        _log_step("[SQL] Aucune donnée retournée sur les bases interrogées")
        # Build a fix prompt for the caller to iterate manually
        fix_prompt = build_sql_fix_prompt(question_text, ddl_statements, current_sql, first_error)
        return {
            "success": True,
            "query": question_text,
            "answer": "",
            "error": "no_data",
            "sqlQuery": sql_req,
            "sqlQueryFixed": current_sql if attempted_retry else "",
            "retryAttempted": attempted_retry,
            "retrySucceeded": False,
            "retryError": first_error,
            "sqlFixPrompt": fix_prompt,
            "selected_codes": selected_codes,
            "model": "gemini-2.5-flash",
            "source": "sqlite",
            "chart": {"type": "bar", "data": []},
        }

    df_all = pd.concat(dfs, ignore_index=True, sort=False)
    _log_step(f"[Data] Fusion des résultats: shape={df_all.shape}")
    _log_step("[LLM] Génération de la réponse finale basée sur les données…")
    ans_text, chart = prompt_with_df(question_text, df_all)
    answer = ans_text or ""
    _log_step("[Pipeline] DONE")

    chart = chart or {"type": "bar", "data": []}

    return {
        "success": True,
        "query": question_text,
        "answer": answer,
        "error": None,
        "sqlQuery": sql_req,
        "sqlQueryFixed": current_sql if attempted_retry else "",
        "retryAttempted": attempted_retry,
        "retrySucceeded": retry_succeeded,
        "retryError": None if retry_succeeded else (first_error or ""),
        "sqlFixPrompt": build_sql_fix_prompt(question_text, ddl_statements, current_sql, None if retry_succeeded else first_error),
        "selected_codes": selected_codes,
        "model": "gemini-2.5-flash",
        "source": "sqlite",
        "chart": chart,
    }


@app.post("/api/ask")
def api_ask(req: AskRequest):
    _log_step(f"[HTTP] POST /api/ask – query='{req.query}'" )
    result = _pipeline_internal(req.query, req.maxCommunes, req.codes)
    # Add optional fields presence according to requested DTO
    return result
