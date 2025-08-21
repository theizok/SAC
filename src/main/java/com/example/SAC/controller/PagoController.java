package com.example.SAC.controller;

import com.example.SAC.dto.PagoDTO;
import com.example.SAC.dto.PagoReservaDTO;
import com.example.SAC.entity.Pago;
import com.example.SAC.entity.Reserva;
import com.example.SAC.entity.Cuenta;
import com.example.SAC.entity.Residente;
import com.example.SAC.repository.PagoRepository;
import com.example.SAC.repository.AreaComunRepository;
import com.example.SAC.repository.ResidenteRepository;
import com.example.SAC.service.PagoService;
import com.example.SAC.service.ReservaService;
import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.preference.PreferenceBackUrlsRequest;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.payment.Payment;
import com.mercadopago.resources.preference.Preference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/pago")
public class PagoController {

    private static final Logger logger = LoggerFactory.getLogger(PagoController.class);

    @Autowired
    private PagoRepository pagoRepository;
    @Autowired
    private PagoService pagoService;
    @Autowired
    private ReservaService reservaService;
    @Autowired
    private AreaComunRepository areaComunRepository;
    @Autowired
    private ResidenteRepository residenteRepository;

    // --------- Helpers: mapeo Pago -> PagoDTO ----------
    private PagoDTO toDTO(Pago p) {
        if (p == null) return null;
        PagoDTO dto = new PagoDTO();
        dto.setIdPago(p.getIdPago());
        dto.setValor(p.getValor());
        dto.setFecha(p.getFecha());
        dto.setDescripcion(p.getDescripcion());
        dto.setCategoria(p.getCategoria());
        dto.setEstadoPago(p.getEstadoPago());
        try {
            if (p.getCuenta() != null) {
                Method m = p.getCuenta().getClass().getMethod("getIdCuenta");
                Object val = m.invoke(p.getCuenta());
                if (val instanceof Number) dto.setIdCuenta(((Number) val).longValue());
            }
        } catch (Exception e) {
            logger.debug("No se pudo extraer idCuenta desde Pago.cuenta: {}", e.getMessage());
        }
        return dto;
    }

    private List<PagoDTO> toDTOList(List<Pago> pagos) {
        if (pagos == null) return Collections.emptyList();
        return pagos.stream().map(this::toDTO).collect(Collectors.toList());
    }

    // ----------------- Pago normal -----------------
    @PostMapping("/mercado-pago")
    public ResponseEntity<?> crearPreferencia(@RequestBody Pago pago) throws MPException, MPApiException {
        // marcar como pendiente y guardar inmediatamente
        pago.setEstadoPago("PENDIENTE");
        if (pago.getFecha() == null) pago.setFecha(LocalDateTime.now());

        // fallback cuenta desde principal si no viene
        try {
            if (pago.getCuenta() == null) {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.getPrincipal() instanceof com.example.SAC.service.CustomUserDetails.CustomUserDetails) {
                    long idCuentaFromPrincipal = ((com.example.SAC.service.CustomUserDetails.CustomUserDetails) auth.getPrincipal()).getIdCuenta();
                    Cuenta cuenta = new Cuenta();
                    cuenta.setIdCuenta(idCuentaFromPrincipal);
                    pago.setCuenta(cuenta);
                }
            }
        } catch (Exception e) {
            logger.debug("No se pudo setear cuenta por fallback: {}", e.getMessage());
        }

        pagoRepository.save(pago);

        // configurar Mercado Pago (mover token a properties/env en producción)
        MercadoPagoConfig.setAccessToken("TEST-6124805663082328-040417-a023ca85ac047fbfca3fc9fb2316df41-2045469211");

        PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                .success("http://localhost:8080/")
                .pending("http://localhost:8080/")
                .failure("http://localhost:8080/")
                .build();

        PreferenceItemRequest itemRequest = PreferenceItemRequest.builder()
                .id(String.valueOf(pago.getIdPago()))
                .title(pago.getCategoria())
                .description(pago.getDescripcion())
                .quantity(1)
                .categoryId(pago.getCategoria())
                .currencyId("COP")
                .unitPrice(BigDecimal.valueOf(pago.getValor()))
                .build();

        List<PreferenceItemRequest> items = new ArrayList<>();
        items.add(itemRequest);

        PreferenceRequest preferenceRequest = PreferenceRequest.builder()
                .items(items)
                .backUrls(backUrls)
                .externalReference(String.valueOf(pago.getIdPago()))
                .build();

        PreferenceClient client = new PreferenceClient();
        Preference preference = client.create(preferenceRequest);

        Map<String, Object> response = new HashMap<>();
        response.put("init_point", preference.getSandboxInitPoint());
        response.put("pago", toDTO(pago));
        return ResponseEntity.ok(response);
    }

    // ----------------- Pago + Reserva (mappeo robusto desde Map payload) -----------------
    @PostMapping("/mercado-pago/reserva")
    public ResponseEntity<?> crearPreferenciaAreaComun(@RequestBody Map<String, Object> dtoMap) throws MPException, MPApiException {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> pagoMap = (Map<String, Object>) dtoMap.get("pago");
            @SuppressWarnings("unchecked")
            Map<String, Object> reservaMap = (Map<String, Object>) dtoMap.get("reserva");

            if (pagoMap == null) return ResponseEntity.badRequest().body(Map.of("message", "Objeto 'pago' requerido"));
            if (reservaMap == null) return ResponseEntity.badRequest().body(Map.of("message", "Objeto 'reserva' requerido"));

            // Construir Pago mínimo
            Pago pago = new Pago();
            if (pagoMap.get("valor") != null) {
                Object v = pagoMap.get("valor");
                if (v instanceof Number) pago.setValor(((Number) v).floatValue());
                else {
                    try { pago.setValor(Float.parseFloat(String.valueOf(v))); } catch (Exception ignored) {}
                }
            }
            if (pagoMap.get("descripcion") != null) pago.setDescripcion(String.valueOf(pagoMap.get("descripcion")));
            if (pagoMap.get("categoria") != null) pago.setCategoria(String.valueOf(pagoMap.get("categoria")));
            if (pago.getFecha() == null) pago.setFecha(LocalDateTime.now());
            pago.setEstadoPago("PENDIENTE");

            // Mapear cuenta si viene
            try {
                if (pagoMap.get("cuenta") instanceof Map) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> cuentaMap = (Map<String, Object>) pagoMap.get("cuenta");
                    Object idCuentaObj = cuentaMap.get("idCuenta");
                    if (idCuentaObj instanceof Number) {
                        Cuenta cuenta = new Cuenta();
                        cuenta.setIdCuenta(((Number) idCuentaObj).longValue());
                        pago.setCuenta(cuenta);
                    } else if (idCuentaObj instanceof String) {
                        try {
                            long idVal = Long.parseLong((String) idCuentaObj);
                            Cuenta cuenta = new Cuenta();
                            cuenta.setIdCuenta(idVal);
                            pago.setCuenta(cuenta);
                        } catch (NumberFormatException ignored) {}
                    }
                }
            } catch (Exception e) {
                logger.debug("No se pudo mapear cuenta desde pagoMap: {}", e.getMessage());
            }

            // Fallback: si pago.cuenta sigue null, obtener idCuenta desde principal autenticado
            try {
                if (pago.getCuenta() == null) {
                    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                    if (auth != null && auth.getPrincipal() instanceof com.example.SAC.service.CustomUserDetails.CustomUserDetails) {
                        long idCuentaFromPrincipal = ((com.example.SAC.service.CustomUserDetails.CustomUserDetails) auth.getPrincipal()).getIdCuenta();
                        Cuenta cuenta = new Cuenta();
                        cuenta.setIdCuenta(idCuentaFromPrincipal);
                        pago.setCuenta(cuenta);
                    }
                }
            } catch (Exception e) {
                logger.debug("No se pudo setear cuenta por fallback (reserva): {}", e.getMessage());
            }

            // Guardar pago
            pagoRepository.save(pago);

            // Construir reserva robustamente
            Reserva reserva = new Reserva();
            try {
                // idAreaComun (Number | String -> int)
                Object idAreaObj = reservaMap.get("idAreaComun");
                if (idAreaObj != null) {
                    try {
                        int idAreaVal;
                        if (idAreaObj instanceof Number) idAreaVal = ((Number) idAreaObj).intValue();
                        else idAreaVal = Integer.parseInt(String.valueOf(idAreaObj));
                        try {
                            Method m = Reserva.class.getMethod("setIdAreaComun", int.class);
                            m.invoke(reserva, idAreaVal);
                        } catch (NoSuchMethodException nsme) {
                            Field f = Reserva.class.getDeclaredField("idAreaComun");
                            f.setAccessible(true);
                            f.setInt(reserva, idAreaVal);
                        }
                    } catch (Exception e) {
                        logger.debug("No se pudo asignar idAreaComun desde payload: {}", e.getMessage());
                    }
                }

                // fechaReserva (espera ISO-8601 string)
                Object fechaObj = reservaMap.get("fechaReserva");
                if (fechaObj != null) {
                    try {
                        String s = String.valueOf(fechaObj);
                        LocalDateTime fecha = LocalDateTime.parse(s);
                        try {
                            Method mf = Reserva.class.getMethod("setFechaReserva", LocalDateTime.class);
                            mf.invoke(reserva, fecha);
                        } catch (NoSuchMethodException nsme) {
                            Field f = Reserva.class.getDeclaredField("fechaReserva");
                            f.setAccessible(true);
                            f.set(reserva, fecha);
                        }
                    } catch (DateTimeParseException dtpe) {
                        logger.debug("No se pudo parsear fechaReserva (formato inválido): {}", fechaObj);
                    } catch (Exception e) {
                        logger.debug("No se pudo parsear/assignar fechaReserva '{}': {}", fechaObj, e.getMessage());
                    }
                }

                // tiempoReserva
                Object tiempoObj = reservaMap.get("tiempoReserva");
                if (tiempoObj != null) {
                    String tiempo = String.valueOf(tiempoObj);
                    try {
                        Method mt = Reserva.class.getMethod("setTiempoReserva", String.class);
                        mt.invoke(reserva, tiempo);
                    } catch (NoSuchMethodException nsme) {
                        try {
                            Field f = Reserva.class.getDeclaredField("tiempoReserva");
                            f.setAccessible(true);
                            f.set(reserva, tiempo);
                        } catch (Exception e) {
                            logger.debug("No se pudo asignar tiempoReserva: {}", e.getMessage());
                        }
                    } catch (Exception e) {
                        logger.debug("Error asignando tiempoReserva por reflection: {}", e.getMessage());
                    }
                }

                // Asignar idResidente o idPropietario según el rol del usuario autenticado
                try {
                    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                    if (auth != null && auth.getPrincipal() instanceof com.example.SAC.service.CustomUserDetails.CustomUserDetails) {
                        com.example.SAC.service.CustomUserDetails.CustomUserDetails userDetails =
                                (com.example.SAC.service.CustomUserDetails.CustomUserDetails) auth.getPrincipal();

                        // Verificar el rol del usuario
                        boolean isResidente = userDetails.getAuthorities().stream()
                                .anyMatch(a -> a.getAuthority().equals("RESIDENTE"));
                        boolean isPropietario = userDetails.getAuthorities().stream()
                                .anyMatch(a -> a.getAuthority().equals("PROPIETARIO"));

                        if (isResidente) {
                            reserva.setIdResidente(userDetails.getId().intValue());
                        } else if (isPropietario) {
                            reserva.setIdPropietario(userDetails.getId().intValue());
                        } else {
                            logger.error("Usuario no tiene rol de RESIDENTE o PROPIETARIO");
                            return ResponseEntity.badRequest().body(Map.of("message", "Usuario no autorizado para hacer reservas"));
                        }
                    }
                } catch (Exception ex) {
                    logger.error("Error al asignar ID de usuario a la reserva: {}", ex.getMessage());
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Error interno al crear reserva"));
                }

                // DEBUG antes de persistir
                try {
                    logger.debug("Reserva construida para persistir -> idAreaComun={}, fechaReserva={}, tiempoReserva={}, idResidente={}, idPropietario={}",
                            (reserva.getIdAreaComun() != 0 ? reserva.getIdAreaComun() : "(no seteado)"),
                            (reserva.getFechaReserva() != null ? reserva.getFechaReserva() : "(no seteado)"),
                            (reserva.getTiempoReserva() != null ? reserva.getTiempoReserva() : "(no seteado)"),
                            (reserva.getIdResidente() != 0 ? reserva.getIdResidente() : "(no seteado)"),
                            (reserva.getIdPropietario() != null ? reserva.getIdPropietario() : "(no seteado)")
                    );
                } catch (Exception e) {
                    logger.debug("No se pudo loggear getters de Reserva, intentando leer campos directos: {}", e.getMessage());
                    try {
                        Field fId = Reserva.class.getDeclaredField("idAreaComun"); fId.setAccessible(true);
                        Field fF = Reserva.class.getDeclaredField("fechaReserva"); fF.setAccessible(true);
                        Field fT = Reserva.class.getDeclaredField("tiempoReserva"); fT.setAccessible(true);
                        Field fR = Reserva.class.getDeclaredField("idResidente"); fR.setAccessible(true);
                        Field fP = Reserva.class.getDeclaredField("idPropietario"); fP.setAccessible(true);
                        logger.debug("Reserva campos directos -> idAreaComun={}, fechaReserva={}, tiempoReserva={}, idResidente={}, idPropietario={}",
                                fId.get(reserva), fF.get(reserva), fT.get(reserva), fR.get(reserva), fP.get(reserva));
                    } catch (Exception ignored) {}
                }

                // VALIDACIÓN: idAreaComun debe estar presente y area existir
                int idAreaToCheck = reserva.getIdAreaComun();
                if (idAreaToCheck <= 0) {
                    return ResponseEntity.badRequest().body(Map.of("message", "idAreaComun no proporcionado o inválido"));
                }
                if (!areaComunRepository.existsById((long) idAreaToCheck)) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Área común no encontrada: " + idAreaToCheck));
                }

            } catch (ClassCastException cce) {
                return ResponseEntity.badRequest().body(Map.of("message","Formato de payload inválido (reserva)"));
            } catch (Exception e) {
                logger.debug("Error mapeando reserva: {}", e.getMessage());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message","Error interno mapeando reserva"));
            }

            // Persistir reserva
            try {
                reservaService.agregarReserva(reserva);
            } catch (IllegalArgumentException ex) {
                return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
            } catch (Exception ex) {
                logger.error("Error guardando reserva: {}", ex.getMessage(), ex);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("message", "Error al crear reserva: " + ex.getMessage()));
            }

            // Crear preferencia MercadoPago
            MercadoPagoConfig.setAccessToken("TEST-6124805663082328-040417-a023ca85ac047fbfca3fc9fb2316df41-2045469211");

            PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                    .success("http://localhost:8080/")
                    .pending("http://localhost:8080/")
                    .failure("http://localhost:8080/")
                    .build();

            PreferenceItemRequest itemRequest = PreferenceItemRequest.builder()
                    .id(String.valueOf(pago.getIdPago()))
                    .title(pago.getCategoria())
                    .description(pago.getDescripcion())
                    .quantity(1)
                    .categoryId(pago.getCategoria())
                    .currencyId("COP")
                    .unitPrice(BigDecimal.valueOf(pago.getValor()))
                    .build();

            List<PreferenceItemRequest> items = new ArrayList<>();
            items.add(itemRequest);

            PreferenceRequest preferenceRequest = PreferenceRequest.builder()
                    .items(items)
                    .backUrls(backUrls)
                    .externalReference(String.valueOf(pago.getIdPago()))
                    .build();

            PreferenceClient client = new PreferenceClient();
            Preference preference = client.create(preferenceRequest);

            Map<String, Object> response = new HashMap<>();
            response.put("init_point", preference.getSandboxInitPoint());
            response.put("pago", toDTO(pago));
            return ResponseEntity.ok(response);

        } catch (ClassCastException cce) {
            return ResponseEntity.badRequest().body(Map.of("message","Formato de payload inválido"));
        } catch (Exception ex) {
            logger.error("Error creando preferencia reserva: {}", ex.getMessage(), ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message","Error interno"));
        }
    }

    // ----------------- Nuevo endpoint: recibir DTO (pago + reserva) -----------------
    @PostMapping("/mercado-pago/reserva/dto")
    public ResponseEntity<?> crearPreferenciaAreaComunDTO(@RequestBody PagoReservaDTO dto) throws MPException, MPApiException {
        if (dto == null || dto.getPago() == null || dto.getReserva() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Payload inválido. Se requiere { pago, reserva }"));
        }

        Pago pago = dto.getPago();
        Reserva reserva = dto.getReserva();

        // Preparar pago
        pago.setEstadoPago("PENDIENTE");
        if (pago.getFecha() == null) pago.setFecha(LocalDateTime.now());

        // fallback cuenta desde principal si no viene
        try {
            if (pago.getCuenta() == null) {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.getPrincipal() instanceof com.example.SAC.service.CustomUserDetails.CustomUserDetails) {
                    long idCuentaFromPrincipal = ((com.example.SAC.service.CustomUserDetails.CustomUserDetails) auth.getPrincipal()).getIdCuenta();
                    Cuenta cuenta = new Cuenta();
                    cuenta.setIdCuenta(idCuentaFromPrincipal);
                    pago.setCuenta(cuenta);
                }
            }
        } catch (Exception e) {
            logger.debug("No se pudo setear cuenta por fallback (DTO): {}", e.getMessage());
        }

        // Guardar pago
        pagoRepository.save(pago);

        // Preparar reserva (validaciones)
        try {
            int idArea = reserva.getIdAreaComun();
            if (idArea <= 0) {
                return ResponseEntity.badRequest().body(Map.of("message", "idAreaComun no proporcionado o inválido"));
            }
            if (!areaComunRepository.existsById((long) idArea)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Área común no encontrada: " + idArea));
            }

            // Asignar idResidente o idPropietario según el rol del usuario autenticado
            if (reserva.getIdResidente() <= 0 && reserva.getIdPropietario() == null) {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.getPrincipal() instanceof com.example.SAC.service.CustomUserDetails.CustomUserDetails) {
                    com.example.SAC.service.CustomUserDetails.CustomUserDetails userDetails =
                            (com.example.SAC.service.CustomUserDetails.CustomUserDetails) auth.getPrincipal();

                    boolean isResidente = userDetails.getAuthorities().stream()
                            .anyMatch(a -> a.getAuthority().equals("RESIDENTE"));
                    boolean isPropietario = userDetails.getAuthorities().stream()
                            .anyMatch(a -> a.getAuthority().equals("PROPIETARIO"));

                    if (isResidente) {
                        reserva.setIdResidente(userDetails.getId().intValue());
                        logger.debug("Se asignó idResidente desde principal (DTO): {}", userDetails.getId());
                    } else if (isPropietario) {
                        reserva.setIdPropietario(userDetails.getId().intValue());
                        logger.debug("Se asignó idPropietario desde principal (DTO): {}", userDetails.getId());
                    } else {
                        return ResponseEntity.badRequest().body(Map.of("message", "No se pudo determinar el ID de usuario. Asegúrese de que el usuario es residente o propietario."));
                    }
                } else {
                    return ResponseEntity.badRequest().body(Map.of("message", "No se pudo determinar el ID de usuario. Usuario no autenticado."));
                }
            }

            if (reserva.getFechaReserva() == null) {
                reserva.setFechaReserva(LocalDateTime.now());
            }

        } catch (Exception e) {
            logger.error("Error preparando reserva desde DTO: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Error interno preparando reserva"));
        }

        // Persistir reserva
        try {
            reservaService.agregarReserva(reserva);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        } catch (Exception ex) {
            logger.error("Error guardando reserva (DTO): {}", ex.getMessage(), ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Error al crear reserva: " + ex.getMessage()));
        }

        // Crear preferencia MercadoPago
        MercadoPagoConfig.setAccessToken("TEST-6124805663082328-040417-a023ca85ac047fbfca3fc9fb2316df41-2045469211");

        PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                .success("http://localhost:8080/")
                .pending("http://localhost:8080/")
                .failure("http://localhost:8080/")
                .build();

        PreferenceItemRequest itemRequest = PreferenceItemRequest.builder()
                .id(String.valueOf(pago.getIdPago()))
                .title(pago.getCategoria())
                .description(pago.getDescripcion())
                .quantity(1)
                .categoryId(pago.getCategoria())
                .currencyId("COP")
                .unitPrice(BigDecimal.valueOf(pago.getValor()))
                .build();

        List<PreferenceItemRequest> items = new ArrayList<>();
        items.add(itemRequest);

        PreferenceRequest preferenceRequest = PreferenceRequest.builder()
                .items(items)
                .backUrls(backUrls)
                .externalReference(String.valueOf(pago.getIdPago()))
                .build();

        PreferenceClient client = new PreferenceClient();
        Preference preference = client.create(preferenceRequest);

        Map<String, Object> response = new HashMap<>();
        response.put("init_point", preference.getSandboxInitPoint());
        response.put("pago", toDTO(pago));
        return ResponseEntity.ok(response);
    }

    // ----------------- Webhook -----------------
    @PostMapping("/webhook")
    public ResponseEntity<?> recibirWebhook(@RequestParam Map<String, String> params) throws MPException, MPApiException {
        String topic = params.get("topic");
        String id = params.get("id");

        if ("payment".equals(topic)) {
            try {
                PaymentClient client = new PaymentClient();
                Payment payment = client.get(Long.parseLong(id));

                String estado = payment.getStatus();
                Long externalReference = Long.parseLong(payment.getExternalReference());

                pagoService.actualizarEstadoPago(externalReference, estado);

                return ResponseEntity.ok("Webhook procesado correctamente");
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Error procesando webhook: " + e.getMessage());
            }
        }

        return ResponseEntity.badRequest().body("Evento no soportado");
    }

    // ----------------- Obtener pagos (filtrado por cuenta del usuario autenticado) -----------------
    @GetMapping("/obtenerPagos")
    public ResponseEntity<?> obtenerPagos() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message","Usuario no autenticado"));
        }

        Object principal = auth.getPrincipal();
        logger.debug("AUTH principal class: {}", principal != null ? principal.getClass().getName() : "null");
        logger.debug("AUTH principal toString: {}", principal);
        logger.debug("AUTH name: {}", auth.getName());

        Long idCuenta = null;

        try {
            if (principal instanceof com.example.SAC.service.CustomUserDetails.CustomUserDetails) {
                long idPrimitive = ((com.example.SAC.service.CustomUserDetails.CustomUserDetails) principal).getIdCuenta();
                idCuenta = Long.valueOf(idPrimitive);
            }
        } catch (Exception e) {
            logger.debug("Error extrayendo idCuenta desde CustomUserDetails: {}", e.getMessage());
        }

        if (idCuenta == null) {
            logger.warn("obtenerPagos: no se pudo extraer idCuenta del principal. Clase={} principal={}",
                    principal != null ? principal.getClass().getName() : "null", principal);
            return ResponseEntity.ok(Collections.emptyList());
        }

        List<Pago> pagos = pagoService.obtenerPagosPorCuenta(idCuenta);

        List<PagoDTO> dtos = toDTOList(pagos);
        return ResponseEntity.ok(dtos);
    }

    // ----------------- Handler para IllegalArgumentException (opcional) -----------------
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
    }

    // ==================== MÉTODOS AUXILIARES ====================
    private Integer extractIdFromPrincipal(Object principal) {
        if (principal == null) return null;

        String[] candidateGetters = {
                "getIdResidente", "getId_residente", "getId", "getIdUsuario",
                "getIdCuenta", "getIdUser", "getUserId", "getIdPerson", "getIdOwner"
        };

        for (String getter : candidateGetters) {
            try {
                Method m = principal.getClass().getMethod(getter);
                Object val = m.invoke(principal);
                Integer parsed = convertToInteger(val);
                if (parsed != null) return parsed;
            } catch (NoSuchMethodException ignored) {
            } catch (Exception e) {
                logger.debug("Error invoking getter {} on principal: {}", getter, e.getMessage());
            }
        }

        String[] candidateFields = {"idResidente", "id_residente", "id", "idUsuario", "idCuenta", "userId"};
        for (String fieldName : candidateFields) {
            try {
                Field f = principal.getClass().getDeclaredField(fieldName);
                f.setAccessible(true);
                Object val = f.get(principal);
                Integer parsed = convertToInteger(val);
                if (parsed != null) return parsed;
            } catch (NoSuchFieldException ignored) {
            } catch (Exception e) {
                logger.debug("Error leyendo campo {} del principal: {}", fieldName, e.getMessage());
            }
        }

        try {
            Method getUsername = principal.getClass().getMethod("getUsername");
            Object username = getUsername.invoke(principal);
            if (username != null) {
                logger.debug("Principal tiene username = {}. Si quieres asignar idResidente desde username, implementa una búsqueda en ResidenteService.", username.toString());
            }
        } catch (NoSuchMethodException ignored) {
        } catch (Exception e) {
            logger.debug("Error al intentar extraer username del principal: {}", e.getMessage());
        }

        return null;
    }

    private Integer convertToInteger(Object val) {
        if (val == null) return null;
        if (val instanceof Number) {
            return ((Number) val).intValue();
        }
        if (val instanceof String) {
            try {
                String s = ((String) val).trim();
                if (s.isEmpty()) return null;
                return Integer.parseInt(s);
            } catch (NumberFormatException e) {
            }
        }
        return null;
    }
}