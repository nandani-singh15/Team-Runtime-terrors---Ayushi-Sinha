package com.swasuraksha.controller;

import com.swasuraksha.dto.ApiResponse;
import com.swasuraksha.entity.TrustedContact;
import com.swasuraksha.service.TrustedContactService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/contacts")
public class TrustedContactController {

    @Autowired
    private TrustedContactService contactService;

    @GetMapping
    public ResponseEntity<ApiResponse> getContacts() {
        List<TrustedContact> contacts = contactService.getContacts();
        return ResponseEntity.ok(new ApiResponse(true, "Contacts fetched successfully", contacts));
    }

    @PostMapping
    public ResponseEntity<ApiResponse> createContact(@RequestBody TrustedContact contact) {
        TrustedContact saved = contactService.createContact(contact);
        return ResponseEntity.ok(new ApiResponse(true, "Contact added successfully", saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updateContact(@PathVariable Long id, @RequestBody TrustedContact contact) {
        TrustedContact updated = contactService.updateContact(id, contact);
        return ResponseEntity.ok(new ApiResponse(true, "Contact updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteContact(@PathVariable Long id) {
        contactService.deleteContact(id);
        return ResponseEntity.ok(new ApiResponse(true, "Contact deleted successfully", null));
    }
}
