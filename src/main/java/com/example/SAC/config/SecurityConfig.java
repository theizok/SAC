package com.example.SAC.config;

import com.example.SAC.service.CustomUserDetails.CustomUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

   @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
        return httpSecurity
                .cors(Customizer.withDefaults())
                .authorizeHttpRequests(auth -> {
                    auth.requestMatchers(HttpMethod.POST,"api/register/propietario","api/register/administrador", "api/register/residente", "api/pago/webhook").permitAll();
                    auth.requestMatchers("/noAuth/**", "/Login/**","/Login/1.jpg", "/InicioNoAuth/**","/", "/noAuth/Register","/Registro/**","/favicon.ico").permitAll();
                    auth.requestMatchers(HttpMethod.POST,"/api/auth/login").permitAll();
                    auth.requestMatchers("/api/residente/**").hasAuthority("RESIDENTE");
                    auth.requestMatchers("/api/propietario/**").hasAuthority("PROPIETARIO");
                    auth.requestMatchers("/api/administrador/**").hasAuthority("ADMINISTRADOR");
                 auth.anyRequest().authenticated();
                })
                .csrf(csrf -> csrf.disable())
                .formLogin(form -> form.disable())//Se deshabilita el form login de spring
                .httpBasic(Customizer.withDefaults())
                .sessionManagement(session -> session
                        .sessionFixation().migrateSession()
                        .sessionCreationPolicy(SessionCreationPolicy.ALWAYS)
                        .invalidSessionUrl("/")
                        .maximumSessions(1)
                        .expiredUrl("/noAuth/Login")
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setContentType("application/json");
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.getWriter().write("{\"error\": \"No autorizado\"}");
                        })
                        )
                .addFilterBefore(new RequestLoggingFilter(), UsernamePasswordAuthenticationFilter.class)
                .build();
    }



    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig,
                                                       CustomUserDetailsService customUserDetailsService,
                                                       PasswordEncoder passwordEncoder) throws Exception {
       //Comparacion de contraseña ingresada con la base de datos
       DaoAuthenticationProvider daoAuthenticationProvider = new DaoAuthenticationProvider();
       daoAuthenticationProvider.setUserDetailsService(customUserDetailsService);
       daoAuthenticationProvider.setPasswordEncoder(passwordEncoder);

       return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {

       return new BCryptPasswordEncoder();
    }

    public class RequestLoggingFilter extends OncePerRequestFilter {
        @Override
        protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
            System.out.println("Solicitud recibida: " + request.getMethod() + " " + request.getRequestURI());
            filterChain.doFilter(request, response);
        }
    }

}
