package com.milite.mapper;

import java.util.List;

import com.milite.dto.ArtifactDto;

public interface ArtifactMapper {
	public List<ArtifactDto> getArtifactInfo();

	public ArtifactDto getArtifactByID(Integer artifactID);
	
	public List<ArtifactDto> getAvailableArtifacts(String job, String session);
}
