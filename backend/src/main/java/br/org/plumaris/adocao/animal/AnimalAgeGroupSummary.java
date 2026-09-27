package br.org.plumaris.adocao.animal;

public record AnimalAgeGroupSummary(
        String species,
        String ageGroup,
        long total
) {
}
