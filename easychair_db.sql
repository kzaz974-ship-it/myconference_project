-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : jeu. 12 mars 2026 à 01:33
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `easychair_db`
--

-- --------------------------------------------------------

--
-- Structure de la table `articles`
--

CREATE TABLE `articles` (
  `id_article` int(11) NOT NULL,
  `titre` varchar(255) NOT NULL,
  `resume` text DEFAULT NULL,
  `fichier_pdf` varchar(255) DEFAULT NULL,
  `statut` enum('soumis','en_review','accepte','rejete') DEFAULT 'soumis',
  `pdf_file` varchar(255) DEFAULT NULL,
  `date_soumission` datetime DEFAULT NULL,
  `id_conf` int(11) DEFAULT NULL,
  `id_author` int(11) DEFAULT NULL,
  `final_decision_by` int(11) DEFAULT NULL,
  `final_decision_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `articles`
--

INSERT INTO `articles` (`id_article`, `titre`, `resume`, `fichier_pdf`, `statut`, `pdf_file`, `date_soumission`, `id_conf`, `id_author`, `final_decision_by`, `final_decision_at`) VALUES
(2, 'Applications de l’Intelligence Artificielle et de l’Analyse des Données pour la Prise de Décision Intelligente', 'L’intelligence artificielle (IA) et l’analyse des données occupent aujourd’hui une place centrale dans le développement de solutions intelligentes capables d’améliorer la prise de décision dans divers domaines. Grâce à l’exploitation des données massives et à l’évolution des algorithmes d’apprentissage automatique et profond, les systèmes informatiques deviennent plus précis, autonomes et performants.\r\nCet article présente une étude des principales techniques de l’intelligence artificielle appliquées à l’analyse des données, en mettant en évidence leur rôle dans l’optimisation des processus décisionnels. Il aborde également les défis liés à la qualité des données, à la sécurité et à l’éthique de l’IA. Les résultats montrent que l’intégration de l’IA et du big data constitue un levier essentiel pour le développement de systèmes intelligents fiables et innovants.', 'Conference_Internationale_IA_Donnees__1__2_1770935987_9593.pdf', 'accepte', NULL, '2026-02-12 23:39:47', 2, 7, NULL, NULL);

--
-- Déclencheurs `articles`
--
DELIMITER $$
CREATE TRIGGER `trg_create_certificate_after_accept` AFTER UPDATE ON `articles` FOR EACH ROW BEGIN
  -- غير إلا تبدّل statut من شي حاجة ل "accepte"
  IF NEW.statut = 'accepte' AND (OLD.statut <> 'accepte' OR OLD.statut IS NULL) THEN

    -- خلق certificate إلا ما كانتش معمولة من قبل
    INSERT IGNORE INTO certificates
      (cert_number, type, id_conf, id_user, id_article, issued_by, issued_at, status)
    VALUES
      (
        CONCAT('CONF', NEW.id_conf, '-', LPAD(NEW.id_article, 6, '0')),
        'acceptance',
        NEW.id_conf,
        NEW.id_author,
        NEW.id_article,
        NEW.final_decision_by,
        NOW(),
        'issued'
      );

  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `article_session`
--

CREATE TABLE `article_session` (
  `id_article` int(11) NOT NULL,
  `id_session` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `article_topic`
--

CREATE TABLE `article_topic` (
  `id_article` int(11) NOT NULL,
  `id_topic` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `assignments`
--

CREATE TABLE `assignments` (
  `id_assignment` int(11) NOT NULL,
  `id_article` int(11) DEFAULT NULL,
  `id_reviewer` int(11) DEFAULT NULL,
  `status` enum('assigned','reviewed') DEFAULT 'assigned',
  `assigned_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `assignments`
--

INSERT INTO `assignments` (`id_assignment`, `id_article`, `id_reviewer`, `status`, `assigned_at`) VALUES
(1, 2, 9, 'assigned', '2026-02-13 22:36:26');

-- --------------------------------------------------------

--
-- Structure de la table `certificates`
--

CREATE TABLE `certificates` (
  `id_cert` int(11) NOT NULL,
  `cert_number` varchar(50) NOT NULL,
  `type` enum('acceptance','participation','reviewer','chair') NOT NULL,
  `id_conf` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `id_article` int(11) DEFAULT NULL,
  `issued_by` int(11) DEFAULT NULL,
  `issued_at` datetime DEFAULT NULL,
  `status` enum('draft','issued','revoked') NOT NULL DEFAULT 'draft',
  `pdf_path` varchar(255) DEFAULT NULL,
  `qr_token` varchar(80) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `certificates`
--

INSERT INTO `certificates` (`id_cert`, `cert_number`, `type`, `id_conf`, `id_user`, `id_article`, `issued_by`, `issued_at`, `status`, `pdf_path`, `qr_token`, `created_at`, `updated_at`) VALUES
(1, 'PART-2-7', 'participation', 2, 7, NULL, NULL, '2026-02-23 10:58:40', 'issued', NULL, NULL, '2026-02-23 10:58:40', '2026-02-23 10:58:40');

-- --------------------------------------------------------

--
-- Structure de la table `conferences`
--

CREATE TABLE `conferences` (
  `id_conf` int(11) NOT NULL,
  `titre` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `date_debut` date DEFAULT NULL,
  `date_fin` date DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `conferences`
--

INSERT INTO `conferences` (`id_conf`, `titre`, `description`, `date_debut`, `date_fin`, `created_by`) VALUES
(2, 'Conférence Internationale sur l’Intelligence Artificielle et les Données', 'Cette conférence vise à rassembler des chercheurs, des ingénieurs et des étudiants afin de discuter des avancées récentes en intelligence artificielle, en big data et en science des données.\nDes ateliers, des présentations et des tables rondes seront organisés pour favoriser l’échange scientifique.', '2026-05-10', '2026-07-10', 8),
(3, 'Journées Scientifiques sur les Technologies du Web et Mobile', 'Cet événement est dédié aux nouvelles technologies du développement web et mobile.\nIl permet aux participants de présenter leurs travaux, projets et recherches dans le domaine informatique.', '2026-06-20', '2026-06-22', 8);

-- --------------------------------------------------------

--
-- Structure de la table `points_log`
--

CREATE TABLE `points_log` (
  `id_log` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `id_article` int(11) NOT NULL,
  `points_awarded` int(11) NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `registrations`
--

CREATE TABLE `registrations` (
  `id_registration` int(11) NOT NULL,
  `id_conf` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `registrations`
--

INSERT INTO `registrations` (`id_registration`, `id_conf`, `id_user`, `created_at`) VALUES
(1, 2, 7, '2026-02-23 10:58:40');

--
-- Déclencheurs `registrations`
--
DELIMITER $$
CREATE TRIGGER `trg_create_participation_certificate` AFTER INSERT ON `registrations` FOR EACH ROW BEGIN

  IF NOT EXISTS (
    SELECT 1 FROM certificates
    WHERE type = 'participation'
    AND id_conf = NEW.id_conf
    AND id_user = NEW.id_user
  ) THEN

    INSERT INTO certificates
      (cert_number, type, id_conf, id_user, issued_at, status)
    VALUES
      (
        CONCAT('PART-', NEW.id_conf, '-', NEW.id_user),
        'participation',
        NEW.id_conf,
        NEW.id_user,
        NOW(),
        'issued'
      );

  END IF;

END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `reviews`
--

CREATE TABLE `reviews` (
  `id_review` int(11) NOT NULL,
  `note` int(11) DEFAULT NULL CHECK (`note` between 0 and 10),
  `commentaire` text DEFAULT NULL,
  `decision` enum('accepte','rejete','mineur','majeur') DEFAULT NULL,
  `id_article` int(11) DEFAULT NULL,
  `id_reviewer` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `reviews`
--

INSERT INTO `reviews` (`id_review`, `note`, `commentaire`, `decision`, `id_article`, `id_reviewer`, `created_at`) VALUES
(1, 9, 'Bien', 'accepte', 2, 9, '2026-02-15 17:38:48');

-- --------------------------------------------------------

--
-- Structure de la table `sessions`
--

CREATE TABLE `sessions` (
  `id_session` int(11) NOT NULL,
  `nom_session` varchar(150) DEFAULT NULL,
  `date_session` date DEFAULT NULL,
  `id_conf` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `topics`
--

CREATE TABLE `topics` (
  `id_topic` int(11) NOT NULL,
  `nom_topic` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id_user` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('author','reviewer','chair') NOT NULL,
  `affiliation` varchar(150) DEFAULT NULL,
  `country` varchar(100) NOT NULL,
  `points` int(11) NOT NULL DEFAULT 0,
  `badge` enum('none','bronze','silver','gold') NOT NULL DEFAULT 'none'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id_user`, `nom`, `prenom`, `email`, `password`, `role`, `affiliation`, `country`, `points`, `badge`) VALUES
(7, 'ZAZ', 'DIJA', 'kzaz974@gmail.com', '$2y$10$tYYy4Mh7IcYaZmNYO519AeV6fs51F5.ZtjgLJO99PQY3FIcsgVzcq', 'author', 'EST', 'maroc', 0, 'none'),
(8, 'RID', 'KHADIJA', 'k.zaz6871@gmail', '$2y$10$E2HKekEg1iNBLWsGGUD/1ONS2PIziOblb5qnSqwlhNne5hA/CFIjy', 'chair', 'EST', 'MAROC', 0, 'none'),
(9, 'bik', 'oussama', 'oussama33@gmail.com', '$2y$10$R1Bc04h47IA2w/X5fbK4aObh3gw.ucDepDfgIRR7R7xaz.M5eEEAC', 'reviewer', 'EST', 'maroc', 0, 'none'),
(10, 'Zhra', 'Fati', 'fati11@gmail.com', '$2y$10$sRi3Ujl8JQmIkAcNFSqySeHHjEwcTIA7zS6gintcl/Gp9W/aGFotq', 'author', 'Ens', 'Maroc', 0, 'none');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `articles`
--
ALTER TABLE `articles`
  ADD PRIMARY KEY (`id_article`),
  ADD KEY `id_conf` (`id_conf`),
  ADD KEY `id_author` (`id_author`),
  ADD KEY `fk_articles_final_by` (`final_decision_by`);

--
-- Index pour la table `article_session`
--
ALTER TABLE `article_session`
  ADD PRIMARY KEY (`id_article`,`id_session`),
  ADD KEY `id_session` (`id_session`);

--
-- Index pour la table `article_topic`
--
ALTER TABLE `article_topic`
  ADD PRIMARY KEY (`id_article`,`id_topic`),
  ADD KEY `id_topic` (`id_topic`);

--
-- Index pour la table `assignments`
--
ALTER TABLE `assignments`
  ADD PRIMARY KEY (`id_assignment`),
  ADD UNIQUE KEY `id_article` (`id_article`,`id_reviewer`),
  ADD KEY `id_reviewer` (`id_reviewer`);

--
-- Index pour la table `certificates`
--
ALTER TABLE `certificates`
  ADD PRIMARY KEY (`id_cert`),
  ADD UNIQUE KEY `uniq_cert_number` (`cert_number`),
  ADD UNIQUE KEY `uniq_type_conf_user_article` (`type`,`id_conf`,`id_user`,`id_article`),
  ADD KEY `idx_conf` (`id_conf`),
  ADD KEY `idx_user` (`id_user`),
  ADD KEY `idx_article` (`id_article`),
  ADD KEY `idx_issued_by` (`issued_by`);

--
-- Index pour la table `conferences`
--
ALTER TABLE `conferences`
  ADD PRIMARY KEY (`id_conf`),
  ADD KEY `fk_conf_creator` (`created_by`);

--
-- Index pour la table `points_log`
--
ALTER TABLE `points_log`
  ADD PRIMARY KEY (`id_log`),
  ADD UNIQUE KEY `uniq_user_article` (`id_user`,`id_article`),
  ADD KEY `id_article` (`id_article`);

--
-- Index pour la table `registrations`
--
ALTER TABLE `registrations`
  ADD PRIMARY KEY (`id_registration`),
  ADD UNIQUE KEY `id_conf` (`id_conf`,`id_user`),
  ADD KEY `id_user` (`id_user`);

--
-- Index pour la table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id_review`),
  ADD UNIQUE KEY `id_article` (`id_article`,`id_reviewer`),
  ADD KEY `id_reviewer` (`id_reviewer`);

--
-- Index pour la table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id_session`),
  ADD KEY `id_conf` (`id_conf`);

--
-- Index pour la table `topics`
--
ALTER TABLE `topics`
  ADD PRIMARY KEY (`id_topic`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id_user`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `articles`
--
ALTER TABLE `articles`
  MODIFY `id_article` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `assignments`
--
ALTER TABLE `assignments`
  MODIFY `id_assignment` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `certificates`
--
ALTER TABLE `certificates`
  MODIFY `id_cert` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `conferences`
--
ALTER TABLE `conferences`
  MODIFY `id_conf` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `points_log`
--
ALTER TABLE `points_log`
  MODIFY `id_log` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `registrations`
--
ALTER TABLE `registrations`
  MODIFY `id_registration` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id_review` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `sessions`
--
ALTER TABLE `sessions`
  MODIFY `id_session` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `topics`
--
ALTER TABLE `topics`
  MODIFY `id_topic` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id_user` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `articles`
--
ALTER TABLE `articles`
  ADD CONSTRAINT `articles_ibfk_1` FOREIGN KEY (`id_conf`) REFERENCES `conferences` (`id_conf`),
  ADD CONSTRAINT `articles_ibfk_2` FOREIGN KEY (`id_author`) REFERENCES `users` (`id_user`),
  ADD CONSTRAINT `fk_articles_final_by` FOREIGN KEY (`final_decision_by`) REFERENCES `users` (`id_user`);

--
-- Contraintes pour la table `article_session`
--
ALTER TABLE `article_session`
  ADD CONSTRAINT `article_session_ibfk_1` FOREIGN KEY (`id_article`) REFERENCES `articles` (`id_article`),
  ADD CONSTRAINT `article_session_ibfk_2` FOREIGN KEY (`id_session`) REFERENCES `sessions` (`id_session`);

--
-- Contraintes pour la table `article_topic`
--
ALTER TABLE `article_topic`
  ADD CONSTRAINT `article_topic_ibfk_1` FOREIGN KEY (`id_article`) REFERENCES `articles` (`id_article`),
  ADD CONSTRAINT `article_topic_ibfk_2` FOREIGN KEY (`id_topic`) REFERENCES `topics` (`id_topic`);

--
-- Contraintes pour la table `assignments`
--
ALTER TABLE `assignments`
  ADD CONSTRAINT `assignments_ibfk_1` FOREIGN KEY (`id_article`) REFERENCES `articles` (`id_article`),
  ADD CONSTRAINT `assignments_ibfk_2` FOREIGN KEY (`id_reviewer`) REFERENCES `users` (`id_user`);

--
-- Contraintes pour la table `certificates`
--
ALTER TABLE `certificates`
  ADD CONSTRAINT `fk_cert_article` FOREIGN KEY (`id_article`) REFERENCES `articles` (`id_article`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_cert_conf` FOREIGN KEY (`id_conf`) REFERENCES `conferences` (`id_conf`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cert_issued_by` FOREIGN KEY (`issued_by`) REFERENCES `users` (`id_user`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_cert_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE;

--
-- Contraintes pour la table `conferences`
--
ALTER TABLE `conferences`
  ADD CONSTRAINT `fk_conf_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id_user`);

--
-- Contraintes pour la table `points_log`
--
ALTER TABLE `points_log`
  ADD CONSTRAINT `points_log_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`),
  ADD CONSTRAINT `points_log_ibfk_2` FOREIGN KEY (`id_article`) REFERENCES `articles` (`id_article`);

--
-- Contraintes pour la table `registrations`
--
ALTER TABLE `registrations`
  ADD CONSTRAINT `registrations_ibfk_1` FOREIGN KEY (`id_conf`) REFERENCES `conferences` (`id_conf`),
  ADD CONSTRAINT `registrations_ibfk_2` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`);

--
-- Contraintes pour la table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`id_article`) REFERENCES `articles` (`id_article`),
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`id_reviewer`) REFERENCES `users` (`id_user`);

--
-- Contraintes pour la table `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`id_conf`) REFERENCES `conferences` (`id_conf`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
