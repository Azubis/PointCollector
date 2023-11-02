package de.micromata.pointcollector;

import de.micromata.pointcollector.models.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;

import io.jsonwebtoken.SignatureAlgorithm;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;




@Service
public class JwtUtil {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);

    private final String SECRET_KEY = "yc&Mym^KKKKJHJHBHJBHJHGHGFGFFDDDSDFGDFFHCGHFJHKJHJHHGHJKHJHJHJHGHVGGVGCRTFUIHKJHJHGBZGIZUKHLJHUTFRDES32AA2QQWERTZUIOPÜÄÖLKJHGFDSA<yxcvbnm,.-.,mnbvcxyasdfgjpüpoiuztrewq1234567890ß098765432wertzuiopölkjhgfdsxcvbnm,.-.,mnbvcxy<yxcghjklöäpoiuztrewIC8DeGc9Nvi32Bf&EuhZf77";

    public String generateJwtToken(String username) {

        return Jwts.builder()
            .setSubject(username)
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() * 1000 * 60 * 60 * 10))
            .signWith(key(),SignatureAlgorithm.HS256)
            .compact();
    }

    private Key key() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    }

    public String getUserNameFromJwtToken(String token) {
        return Jwts.parserBuilder().setSigningKey(key()).build()
            .parseClaimsJws(token).getBody().getSubject();
    }

    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(key()).build().parse(authToken);
            return true;
        } catch (MalformedJwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("JWT claims string is empty: {}", e.getMessage());
        }

        return false;
    }
}