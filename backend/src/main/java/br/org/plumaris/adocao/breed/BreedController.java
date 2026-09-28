package br.org.plumaris.adocao.breed;

import java.util.List;

import jakarta.validation.Valid;
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
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import br.org.plumaris.adocao.database.DatabaseConstraintException;

@RestController
@RequestMapping("/api/racas")
public class BreedController {

    private final BreedRepository breedRepository;

    public BreedController(BreedRepository breedRepository) {
        this.breedRepository = breedRepository;
    }

    @GetMapping
    public List<BreedResponse> findAll() {
        return breedRepository.findAll();
    }

    @GetMapping("/{id}")
    public BreedResponse findById(@PathVariable int id) {
        return breedRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Breed not found"));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BreedResponse create(@Valid @RequestBody BreedRequest request) {
        return breedRepository.create(request.normalizedName(), request.species());
    }

    @PutMapping("/{id}")
    public BreedResponse update(@PathVariable int id, @Valid @RequestBody BreedRequest request) {
        return breedRepository.update(id, request.normalizedName(), request.species())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Breed not found"));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable int id) {
        if (!breedRepository.delete(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Breed not found");
        }
    }

    @ExceptionHandler(DatabaseConstraintException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ProblemDetail handleDuplicate() {
        return ProblemDetail.forStatusAndDetail(
                HttpStatus.CONFLICT, "A breed with this name and species already exists");
    }
}
