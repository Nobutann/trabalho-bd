package br.org.plumaris.adocao.animal;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/animais")
public class AnimalController {

    private final AnimalRepository animalRepository;

    public AnimalController(AnimalRepository animalRepository) {
        this.animalRepository = animalRepository;
    }

    @GetMapping
    public List<AnimalResponse> findAll() {
        return animalRepository.findAll();
    }

    @GetMapping("/resumo-por-especie")
    public List<AnimalSpeciesSummary> summarizeBySpecies() {
        return animalRepository.summarizeBySpecies();
    }

    @GetMapping("/faixas-etarias")
    public List<AnimalAgeGroupSummary> summarizeByAgeGroup() {
        return animalRepository.summarizeByAgeGroup();
    }
}
