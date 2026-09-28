package br.org.plumaris.adocao.center;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/centros")
public class CenterController {

    private final CenterRepository centerRepository;

    public CenterController(CenterRepository centerRepository) {
        this.centerRepository = centerRepository;
    }

    @GetMapping
    public List<CenterResponse> findAll() {
        return centerRepository.findAll();
    }
}
