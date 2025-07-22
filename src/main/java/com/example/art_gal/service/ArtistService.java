package com.example.art_gal.service;

import com.example.art_gal.dto.ArtistDTO;
import com.example.art_gal.entity.Artist;
import com.example.art_gal.exception.ResourceNotFoundException;
import com.example.art_gal.repository.ArtistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ArtistService {

    @Autowired
    private ArtistRepository artistRepository;

    // Lấy tất cả họa sĩ
    public List<ArtistDTO> getAllArtists() {
        return artistRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Lấy họa sĩ theo ID
    public ArtistDTO getArtistById(Long id) {
        Artist artist = findArtistById(id);
        return convertToDTO(artist);
    }

    // Tạo họa sĩ mới
    public ArtistDTO createArtist(ArtistDTO artistDTO) {
        Artist artist = convertToEntity(artistDTO);
        Artist savedArtist = artistRepository.save(artist);
        return convertToDTO(savedArtist);
    }

    // Cập nhật họa sĩ
    public ArtistDTO updateArtist(Long id, ArtistDTO artistDTO) {
        Artist artist = findArtistById(id);

        artist.setName(artistDTO.getName());
        artist.setBiography(artistDTO.getBiography());
        artist.setPhone(artistDTO.getPhone());
        artist.setEmail(artistDTO.getEmail());
        artist.setAddress(artistDTO.getAddress());
        artist.setStatus(artistDTO.isStatus());

        Artist updatedArtist = artistRepository.save(artist);
        return convertToDTO(updatedArtist);
    }

    // Xóa họa sĩ
    public void deleteArtist(Long id) {
        Artist artist = findArtistById(id);
        artistRepository.delete(artist);
    }

    // --- Phương thức private tiện ích ---

    private Artist findArtistById(Long id) {
        return artistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Artist not found with id: " + id));
    }

    private ArtistDTO convertToDTO(Artist artist) {
        ArtistDTO dto = new ArtistDTO();
        dto.setId(artist.getId());
        dto.setName(artist.getName());
        dto.setBiography(artist.getBiography());
        dto.setPhone(artist.getPhone());
        dto.setEmail(artist.getEmail());
        dto.setAddress(artist.getAddress());
        dto.setStatus(artist.isStatus());
        return dto;
    }

    private Artist convertToEntity(ArtistDTO dto) {
        Artist artist = new Artist();
        // Không set ID cho entity mới
        artist.setName(dto.getName());
        artist.setBiography(dto.getBiography());
        artist.setPhone(dto.getPhone());
        artist.setEmail(dto.getEmail());
        artist.setAddress(dto.getAddress());
        artist.setStatus(dto.isStatus());
        return artist;
    }
}