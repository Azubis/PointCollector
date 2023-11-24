package de.micromata.pointcollector.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@RequiredArgsConstructor
public class UserLoginDTO {
    @NonNull
    private String identifier;
    @NonNull
    private String password;


}