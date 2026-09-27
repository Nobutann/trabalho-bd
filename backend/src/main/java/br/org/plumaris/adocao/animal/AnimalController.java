package br.org.plumaris.adocao.animal;

import java.util.List;

import jakarta.validation.Valid;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

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

    @GetMapping("/{id}")
    public AnimalResponse findById(@PathVariable int id) {
        return animalRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Animal not found"));
    }

    @GetMapping("/resumo-por-especie")
    public List<AnimalSpeciesSummary> summarizeBySpecies() {
        return animalRepository.summarizeBySpecies();
    }

    @GetMapping("/faixas-etarias")
    public List<AnimalAgeGroupSummary> summarizeByAgeGroup() {
        return animalRepository.summarizeByAgeGroup();
    }

    @GetMapping("/recomendados")
    public List<AnimalResponse> findRecommended(@RequestParam("userId") int userId) {
        return animalRepository.findRecommendedForUser(userId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AnimalResponse create(@Valid @RequestBody AnimalRequest request) {
        validateReferences(request);
        int id = animalRepository.create(request);
        return animalRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Created animal not found"));
    }

    @PutMapping("/{id}")
    public AnimalResponse update(@PathVariable int id, @Valid @RequestBody AnimalRequest request) {
        findById(id);
        validateReferences(request);
        animalRepository.update(id, request);
        return findById(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable int id) {
        if (!animalRepository.delete(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Animal not found");
        }
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ProblemDetail handleDataIntegrityViolation() {
        return ProblemDetail.forStatusAndDetail(
                HttpStatus.CONFLICT, "Animal could not be saved because of a database constraint");
    }

    private void validateReferences(AnimalRequest request) {
        if (!animalRepository.centerExists(request.centerId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Adoption center not found");
        }

        if (request.breedId() != null) {
            String breedSpecies = animalRepository.findBreedSpecies(request.breedId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Breed not found"));

            if (!breedSpecies.equals(request.species())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Breed species does not match animal species");
            }
        }
    }
}
