USE adocao_bd;

-- 1. Animals with their adoption center and breed
SELECT
    a.idAnimal,
    a.nome,
    a.especie,
    a.dataNascimento,
    a.sexo,
    a.porte,
    a.cor,
    a.descricao,
    a.disponibilidade,
    a.idCentro,
    c.nome AS centroNome,
    a.idRaca,
    r.nome AS racaNome
FROM Animal a
JOIN Centro_Adocao c ON c.idConta = a.idCentro
LEFT JOIN Raca r ON r.idRaca = a.idRaca
ORDER BY a.idAnimal;

-- 2. Animal counts by species and availability
SELECT
    a.especie,
    COUNT(*) AS total,
    SUM(CASE WHEN a.disponibilidade = 1 THEN 1 ELSE 0 END) AS available,
    SUM(CASE WHEN a.disponibilidade = 0 THEN 1 ELSE 0 END) AS unavailable
FROM Animal a
GROUP BY a.especie
ORDER BY a.especie;
