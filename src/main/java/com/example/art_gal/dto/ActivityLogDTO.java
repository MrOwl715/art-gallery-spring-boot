package com.example.art_gal.dto;

import lombok.Data;
import java.util.Date;

@Data
public class ActivityLogDTO {
    private String actor;
    private String action;
    private String details;
    private Date createdAt;
}