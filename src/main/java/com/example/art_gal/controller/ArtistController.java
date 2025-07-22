package com.example.art_gal.controller;

import com.example.art_gal.dto.ArtistDTO;
import com.example.art_gal.service.ArtistService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/artists")
public class ArtistController {

    @Autowired
    private ArtistService artistService;

    // API lấy danh sách tất cả họa sĩ
    @GetMapping
    public List<ArtistDTO> getAllArtists() {
        return artistService.getAllArtists();
    }

    // API lấy thông tin một họa sĩ theo ID
    @GetMapping("/{id}")
    public ResponseEntity<ArtistDTO> getArtistById(@PathVariable(value = "id") Long artistId) {
        ArtistDTO artistDTO = artistService.getArtistById(artistId);
        return ResponseEntity.ok().body(artistDTO);
    }

    // API tạo một họa sĩ mới
    @PostMapping
    public ResponseEntity<ArtistDTO> createArtist(@Valid @RequestBody ArtistDTO artistDTO) {
        ArtistDTO createdArtist = artistService.createArtist(artistDTO);
        return new ResponseEntity<>(createdArtist, HttpStatus.CREATED);
    }

    // API cập nhật thông tin họa sĩ
    @PutMapping("/{id}")
    public ResponseEntity<ArtistDTO> updateArtist(@PathVariable(value = "id") Long artistId,
                                                   @Valid @RequestBody ArtistDTO artistDetails) {
        ArtistDTO updatedArtist = artistService.updateArtist(artistId, artistDetails);
        return ResponseEntity.ok(updatedArtist);
    }

    // API xóa một họa sĩ
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteArtist(@PathVariable(value = "id") Long artistId) {
        artistService.deleteArtist(artistId);
        return ResponseEntity.noContent().build();
    }
}