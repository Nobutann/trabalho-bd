package br.org.plumaris.adocao.animal;

public record AnimalSpeciesSummary(
        String species,
        long total,
        long available,
        long unavailable
) {
}
