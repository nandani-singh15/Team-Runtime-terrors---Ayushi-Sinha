package com.swasuraksha.service;

import com.swasuraksha.entity.TrustedContact;
import com.swasuraksha.entity.User;
import com.swasuraksha.repository.TrustedContactRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class TrustedContactService {

    @Autowired
    private TrustedContactRepository contactRepository;

    @Autowired
    private AuthService authService;

    public List<TrustedContact> getContacts() {
        User user = authService.getAuthenticatedUser();
        return contactRepository.findByUser(user);
    }

    public TrustedContact createContact(TrustedContact contact) {
        User user = authService.getAuthenticatedUser();
        contact.setUser(user);
        return contactRepository.save(contact);
    }

    public TrustedContact updateContact(Long id, TrustedContact updatedContact) {
        User user = authService.getAuthenticatedUser();
        TrustedContact contact = contactRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contact not found"));

        if (!contact.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized action.");
        }

        contact.setName(updatedContact.getName());
        contact.setPhoneNumber(updatedContact.getPhoneNumber());
        contact.setEmail(updatedContact.getEmail());
        contact.setPrimary(updatedContact.isPrimary());
        contact.setSilentEscortEnabled(updatedContact.isSilentEscortEnabled());

        return contactRepository.save(contact);
    }

    public void deleteContact(Long id) {
        User user = authService.getAuthenticatedUser();
        TrustedContact contact = contactRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contact not found"));

        if (!contact.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized action.");
        }

        contactRepository.delete(contact);
    }
}
