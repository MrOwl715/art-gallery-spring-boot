package com.example.art_gal.controller;

import com.example.art_gal.dto.PaintingDTO;
import com.example.art_gal.service.PaintingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/paintings")
public class PaintingController {

    @Autowired
    private PaintingService paintingService;

    // @PostMapping
    // public ResponseEntity<PaintingDTO> createPainting(@Valid @RequestBody PaintingDTO paintingDTO) {
    //     PaintingDTO createdPainting = paintingService.createPainting(paintingDTO);
    //     return new ResponseEntity<>(createdPainting, HttpStatus.CREATED);
    // }

    @GetMapping
    public List<PaintingDTO> getAllPaintings() {
        return paintingService.getAllPaintings();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaintingDTO> getPaintingById(@PathVariable(value = "id") Long paintingId) {
        PaintingDTO paintingDTO = paintingService.getPaintingById(paintingId);
        return ResponseEntity.ok(paintingDTO);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PaintingDTO> updatePainting(@PathVariable(value = "id") Long paintingId,
                                                      @Valid @RequestBody PaintingDTO paintingDetails) {
        PaintingDTO updatedPainting = paintingService.updatePainting(paintingId, paintingDetails);
        return ResponseEntity.ok(updatedPainting);
    }

    // @DeleteMapping("/{id}")
    // public ResponseEntity<Void> deletePainting(@PathVariable(value = "id") Long paintingId) {
    //     paintingService.deletePainting(paintingId);
    //     return ResponseEntity.noContent().build();
    // }
}