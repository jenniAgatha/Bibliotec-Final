-- --------------------------------------------------------
-- Servidor:                     127.0.0.1
-- Versão do servidor:           11.8.2-MariaDB - mariadb.org binary distribution
-- OS do Servidor:               Win64
-- HeidiSQL Versão:              12.10.0.7000
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Copiando estrutura do banco de dados para dblivraria
CREATE DATABASE IF NOT EXISTS `dblivraria` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci */;
USE `dblivraria`;

-- Copiando estrutura para tabela dblivraria.avaliacoes
CREATE TABLE IF NOT EXISTS `avaliacoes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `livro_id` int(11) NOT NULL,
  `nota` decimal(2,1) DEFAULT NULL CHECK (`nota` >= 0 and `nota` <= 5),
  `comentario` text DEFAULT NULL,
  `data_avaliacao` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `livro_id` (`livro_id`),
  CONSTRAINT `avaliacoes_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `avaliacoes_ibfk_2` FOREIGN KEY (`livro_id`) REFERENCES `livros` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Copiando dados para a tabela dblivraria.avaliacoes: ~4 rows (aproximadamente)
INSERT INTO `avaliacoes` (`id`, `usuario_id`, `livro_id`, `nota`, `comentario`, `data_avaliacao`) VALUES
	(1, 1, 1, 5.0, 'História envolvente e personagens cativantes.', '2025-11-05 12:03:35'),
	(2, 2, 1, 4.5, 'Ótima leitura, final surpreendente.', '2025-11-05 12:03:35'),
	(4, 1, 4, 5.0, 'Leitura obrigatória para todo desenvolvedor.', '2025-11-05 12:03:35'),
	(5, 2, 3, 3.5, 'Ideia interessante, mas um pouco confusa em alguns trechos.', '2025-11-05 12:03:35');

-- Copiando estrutura para tabela dblivraria.codigos_verificacao
CREATE TABLE IF NOT EXISTS `codigos_verificacao` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `codigo` varchar(10) DEFAULT NULL,
  `expira_em` datetime NOT NULL,
  `usado` tinyint(1) DEFAULT 0,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Copiando dados para a tabela dblivraria.codigos_verificacao: ~0 rows (aproximadamente)

-- Copiando estrutura para tabela dblivraria.favoritos
CREATE TABLE IF NOT EXISTS `favoritos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `livro_id` int(11) NOT NULL,
  `data_favoritado` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `livro_id` (`livro_id`),
  CONSTRAINT `favoritos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `favoritos_ibfk_2` FOREIGN KEY (`livro_id`) REFERENCES `livros` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Copiando dados para a tabela dblivraria.favoritos: ~2 rows (aproximadamente)
INSERT INTO `favoritos` (`id`, `usuario_id`, `livro_id`, `data_favoritado`) VALUES
	(2, 1, 3, '2025-12-01 12:33:51');

-- Copiando estrutura para tabela dblivraria.livros
CREATE TABLE IF NOT EXISTS `livros` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(150) NOT NULL,
  `autor` varchar(100) NOT NULL,
  `genero` varchar(100) DEFAULT NULL,
  `editora` varchar(100) DEFAULT NULL,
  `ano_publicacao` smallint(6) DEFAULT NULL,
  `isbn` varchar(20) DEFAULT NULL,
  `idioma` varchar(50) DEFAULT 'Português',
  `formato` enum('Físico','E-book','Audiobook') DEFAULT 'Físico',
  `caminho_capa` varchar(255) DEFAULT NULL,
  `sinopse` text DEFAULT NULL,
  `ativo` tinyint(1) DEFAULT 1,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Copiando dados para a tabela dblivraria.livros: ~8 rows (aproximadamente)
INSERT INTO `livros` (`id`, `titulo`, `autor`, `genero`, `editora`, `ano_publicacao`, `isbn`, `idioma`, `formato`, `caminho_capa`, `sinopse`, `ativo`, `criado_em`, `atualizado_em`) VALUES
	(1, 'Filhas da Lua', 'Carolina França', 'Romance', 'Pandorga', 2018, '9788568263952', 'Português', 'Físico', 'https://m.media-amazon.com/images/I/41s1zTT182L._SY445_SX342_QL70_ML2_.jpg', NULL, 1, '2025-11-05 12:02:18', '2025-12-12 13:20:48'),
	(2, 'TI para Negócios', 'Edson Perin', 'Tecnologia / Gestão', 'M. Books', 2010, '9788578271541', 'Português', 'E-book', 'capas/tiparanegocios.jpg', 'Mostra como a TI pode impulsionar resultados empresariais.', 0, '2025-11-05 12:02:18', '2025-11-27 11:58:43'),
	(3, 'Mestres do Tempo', 'R. V. Campbell', 'Ficção Científica', 'Arqueiro', 2017, '9788580417432', 'Português', 'Físico', 'capas/mestresdotempo.jpg', 'Explora viagens no tempo e dilemas morais sobre alterar o passado.', 1, '2025-11-05 12:02:18', '2025-11-05 12:02:18'),
	(4, 'O Código Limpo', 'Robert C. Martin', 'Tecnologia / Programação', 'Alta Books', 2009, '9788576082675', 'Português', 'Físico', 'capas/codigolimpo.jpg', 'Guia essencial sobre boas práticas e padrões de código limpo.', 1, '2025-11-05 12:02:18', '2025-11-25 12:39:36'),
	(5, '1984', 'George Orwell 5 ', 'Ficção Distópica', 'Companhia das Letras', 1949, '978-8535914849', 'Português', 'Físico', '/imagens/1984.jpg', 'Um romance sobre totalitarismo...', 1, '2025-11-05 12:02:18', '2025-11-25 12:33:53'),
	(6, 'Dom Casmurro', 'Machado de Assis', 'Romance', 'Principis', 1899, '9788580574463', 'Português', 'Físico', 'https://editoralandmark.com.br/v2.0/wp-content/uploads/2023/07/DOM-CASMURRO-CAPA-1.jpg', NULL, 1, '2025-11-25 12:20:22', '2025-12-12 13:15:05'),
	(13, 'Harry Potter', 'J.K Rowling', 'Ficção', 'Rocco', 1997, '8532511015', 'Português', 'Físico', 'https://m.media-amazon.com/images/I/61jgm6ooXzL._SY466_.jpg', ' Harry Potter é um garoto cujos pais, feiticeiros, foram assassinados por um poderosíssimo bruxo quando ele ainda era um bebê. Ele foi levado, então, para a casa dos tios que nada tinham a ver com o sobrenatural. Pelo contrário. Até os 10 anos, Harry foi uma espécie de gata borralheira: maltratado pelos tios, herdava roupas velhas do primo gorducho, tinha óculos remendados e era tratado como um estorvo.No dia de seu aniversário de 11 anos, entretanto, ele parece deslizar por um buraco sem fundo, como o de Alice no país das maravilhas, que o conduz a um mundo mágico. Descobre sua verdadeira história e seu destino: ser um aprendiz de feiticeiro.', 1, '2025-12-12 12:45:48', '2025-12-12 12:45:48'),
	(14, 'É assim que acaba', 'Collen Hoover', 'Romance', 'Galera', 2018, '8501112518', 'Português', 'Físico', 'https://m.media-amazon.com/images/I/91r5G8RxqfL._SY466_.jpg', 'Em É assim que acaba, Colleen Hoover nos apresenta Lily, uma jovem que se mudou de uma cidadezinha do Maine para Boston, se formou em marketing e abriu a própria floricultura. E é em um dos terraços de Boston que ela conhece Ryle, um neurocirurgião confiante, teimoso e talvez até um pouco arrogante, com uma grande aversão a relacionamentos, mas que se sente muito atraído por ela.', 1, '2025-12-12 12:52:47', '2025-12-12 12:52:47');

-- Copiando estrutura para tabela dblivraria.reservas
CREATE TABLE IF NOT EXISTS `reservas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `livro_id` int(11) NOT NULL,
  `data_retirada` date NOT NULL,
  `data_devolucao` date NOT NULL,
  `confirmado_email` tinyint(1) DEFAULT 0,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `livro_id` (`livro_id`),
  CONSTRAINT `reservas_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reservas_ibfk_2` FOREIGN KEY (`livro_id`) REFERENCES `livros` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Copiando dados para a tabela dblivraria.reservas: ~3 rows (aproximadamente)
INSERT INTO `reservas` (`id`, `usuario_id`, `livro_id`, `data_retirada`, `data_devolucao`, `confirmado_email`, `criado_em`) VALUES
	(1, 6, 5, '2024-12-01', '2024-12-15', 1, '2025-11-26 12:26:39'),
	(4, 5, 2, '2024-12-01', '2024-12-15', 1, '2025-11-27 11:58:43');

-- Copiando estrutura para tabela dblivraria.usuarios
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `senha` varchar(100) NOT NULL,
  `data_nascimento` date DEFAULT NULL,
  `celular` varchar(20) DEFAULT NULL,
  `curso` varchar(100) DEFAULT NULL,
  `perfil` enum('Aluno','Admin') DEFAULT 'Aluno',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Copiando dados para a tabela dblivraria.usuarios: ~12 rows (aproximadamente)
INSERT INTO `usuarios` (`id`, `nome`, `email`, `senha`, `data_nascimento`, `celular`, `curso`, `perfil`) VALUES
	(1, 'Vitor Lima', 'vitor.lima@email.com', '1234', NULL, NULL, NULL, 'Admin'),
	(2, 'Pedro Campos', 'pedro.campos@email.com', 'abcd', NULL, NULL, NULL, 'Aluno'),
	(4, 'Davi Guedes', 'davi.guedes@email.com', 'teste123', NULL, NULL, NULL, 'Aluno'),
	(5, 'Matheus Lima', 'matheus.lima@email.com', '3210', NULL, NULL, NULL, 'Aluno'),
	(6, 'Gabriel', 'gabriel.corinthians@email.com', '1910', NULL, NULL, NULL, 'Aluno'),
	(13, 'Giovanna', 'giovanna.roblox@email.com', '1104', '2008-02-07', '11921356894', 'ADS', 'Aluno'),
	(14, 'Luana', 'luluzinha.lu@email.com', '$2b$10$QyxIMBQy117CoBxg5I9nV.cn9KxRUKnpafv40wXi7sMAJqFMZqOQi', '2008-07-12', '11988776655', 'Adm', 'Aluno'),
	(15, 'isabella', 'isaBella@email.com', '$2b$10$DWBJey.MjPmA6wvu/UoMkuIQHbhKCSOtu7allW/PaBNqkvEcRbAGS', '2008-07-23', '1198765336', 'Administração', 'Aluno'),
	(16, 'Lorena', 'llomarques0311@gmail.com', '$2b$10$VAe3YIbb72VrJPeeOoPgAOB46N.EdQxFuxV7wgnnlKivS8IgrZvnS', '1996-02-07', '11980183457', 'adm', 'Aluno'),
	(17, 'jenny', 'jenny@gmail.com', '$2b$10$rtr7ixCY93OQsbs8fW/CZuFwrD9UhUD0.ptUUBmRpxl9M5Akfrtrq', '2007-09-03', '11915142081', 'Ads', 'Aluno'),
	(18, 'Teste', 'teste@email.com', '$2b$10$n1Ll8tDr2bQbhJUevxd8.OeihKrSowMCq7eC6Q915jGOlr7QxQtgK', '2001-03-03', '11915142081', 'Ads', 'Admin'),
	(19, 'Gabriel', 'biel111107@gmail.com', '$2b$10$pzIcl0GV08E9jpxuTK5Nx./7Lbl5jlGfzEwhIWtHhKDd4UJIcWy8e', '2007-11-11', '11915142081', 'Ads', 'Aluno'),
	(28, 'jenny', 'teste778@email.com', '1213132423432', '2000-02-12', '(11) 90090-9098', 'ads', 'Aluno'),
	(29, 'Lorena', 'llomarques1103@gmail.com', '$2b$10$q8ZN3VyoTjfJBh393vtESu9xPg/3iUsvxKPU3mqYBt/lgnlmN2Bou', '2007-03-11', '(11) 96783-0824', 'Ads', 'Aluno'),
	(30, 'Jennifer', 'jennigoncaca@gmail.com', '$2b$10$tUCiaWXyf4uxBbRYJwuK4Oxk4TKiKpWJWryfXsc6oF2H7bpnFi4ZC', '2007-09-03', '(11) 91514-2081', 'Ads', 'Aluno'),
	(31, 'Lorena', 'lolomarquesdasilva1@gmail.com', '$2b$10$av3nkXH5pWeY358ZDCyOru1IBwNzbOZF3488gHaAjCnWY/UWQQ8yi', '2007-12-11', '(11) 96783-0824', 'Ads', 'Aluno');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
