package com.example.SAC.controller;

import com.example.SAC.entity.Pago;
import com.example.SAC.repository.PagoRepository;
import com.example.SAC.service.PagoService;
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
import com.mercadopago.resources.preference.PreferenceBackUrls;
import com.mercadopago.resources.preference.PreferenceItem;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/pago")
public class PagoController {

    @Autowired
    private PagoRepository pagoRepository;
    @Autowired
    private PagoService pagoService;

    @PostMapping("/mercado-pago")
    public ResponseEntity<?> crearPreferencia(@RequestBody Pago pago) throws MPException, MPApiException {
        pago.setEstadoPago("PENDENTE");
        pagoRepository.save(pago);

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

        Map<String, String> response = new HashMap<>();
        response.put("init_point", preference.getSandboxInitPoint());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/webhook")
    public ResponseEntity<?> recibirWebhook(@RequestParam Map<String, String> params) throws MPException, MPApiException {
        String topic = params.get("topic");
        String id = params.get("id");

        if ("payment".equals(topic)) {
            try {
                PaymentClient client = new PaymentClient();

                // ✅ Aquí se obtiene el pago real desde Mercado Pago
                Payment payment = client.get(Long.parseLong(id));

                String estado = payment.getStatus(); // approved, pending, etc.
                Long externalReference = Long.parseLong(payment.getExternalReference());

                // ✅ Aquí actualizas el pago en tu base de datos
                pagoService.actualizarEstadoPago(externalReference, estado);

                return ResponseEntity.ok("Webhook procesado correctamente");
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Error procesando webhook: " + e.getMessage());
            }
        }

        return ResponseEntity.badRequest().body("Evento no soportado");
    }

    @GetMapping("/obtenerPagos")
    public List<Pago> obtenerPagos() {
        return pagoService.obtenerPagos();
    }
}
