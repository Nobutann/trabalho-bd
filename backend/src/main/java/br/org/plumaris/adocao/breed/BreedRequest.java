package br.org.plumaris.adocao.breed;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record BreedRequest(
        @NotBlank @Size(max = 80) String name,
        @NotBlank @Pattern(regexp = "Cao|Gato") String species
) {

    public String normalizedName() {
        return name.strip();
    }
}
