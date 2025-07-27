package com.cart.ecom_proj.service;

import com.cart.ecom_proj.model.Customer;
import com.cart.ecom_proj.model.CustomerActivity;
import com.cart.ecom_proj.repo.CustomerRepo;
import com.cart.ecom_proj.repo.CustomerActivityRepo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class VisitPurchaseTrackingTest {

    @Mock
    private CustomerRepo customerRepo;

    @Mock
    private CustomerActivityRepo customerActivityRepo;

    @Mock
    private VisitTrackingService visitTrackingService;

    @InjectMocks
    private CustomerService customerService;

    private Customer testCustomer;

    @BeforeEach
    void setUp() {
        testCustomer = new Customer();
        testCustomer.setId(1L);
        testCustomer.setUsername("testuser");
        testCustomer.setEmail("test@example.com");
        testCustomer.setVisitCount(0L);
        testCustomer.setPurchaseCount(0L);
        testCustomer.setCreatedAt(LocalDateTime.now());
    }

    @Test
    void testTrackCustomerVisit_ShouldIncrementVisitCount() {
        // Arrange
        when(customerRepo.findById(1L)).thenReturn(Optional.of(testCustomer));
        when(visitTrackingService.shouldTrackVisit("session123", 1L)).thenReturn(true);
        when(customerRepo.save(any(Customer.class))).thenReturn(testCustomer);

        // Act
        customerService.trackCustomerVisit(1L, "session123", "127.0.0.1", "Mozilla/5.0", "/product/1", "http://example.com");

        // Assert
        verify(customerRepo).save(argThat(customer -> 
            customer.getVisitCount().equals(1L) && 
            customer.getLastVisitAt() != null
        ));
        verify(customerActivityRepo).save(any(CustomerActivity.class));
    }

    @Test
    void testTrackCustomerVisit_ShouldNotIncrementIfSessionAlreadyTracked() {
        // Arrange
        when(customerRepo.findById(1L)).thenReturn(Optional.of(testCustomer));
        when(visitTrackingService.shouldTrackVisit("session123", 1L)).thenReturn(false);

        // Act
        customerService.trackCustomerVisit(1L, "session123", "127.0.0.1", "Mozilla/5.0", "/product/1", "http://example.com");

        // Assert
        verify(customerRepo, never()).save(any(Customer.class));
        verify(customerActivityRepo).save(any(CustomerActivity.class)); // Activity should still be recorded
    }

    @Test
    void testTrackCustomerPurchase_ShouldIncrementPurchaseCount() {
        // Arrange
        when(customerRepo.findById(1L)).thenReturn(Optional.of(testCustomer));
        when(customerRepo.save(any(Customer.class))).thenReturn(testCustomer);

        // Act
        customerService.trackCustomerPurchase(1L, "ORD123", "session123");

        // Assert
        verify(customerRepo).save(argThat(customer -> 
            customer.getPurchaseCount().equals(1L) && 
            customer.getLastPurchaseAt() != null
        ));
        verify(customerActivityRepo).save(any(CustomerActivity.class));
    }

    @Test
    void testVisitTrackingService_ShouldTrackNewSession() {
        // Arrange
        VisitTrackingService service = new VisitTrackingService();

        // Act & Assert
        assertTrue(service.shouldTrackVisit("session123", 1L));
        assertFalse(service.shouldTrackVisit("session123", 1L)); // Same session should not be tracked again
        assertTrue(service.shouldTrackVisit("session456", 1L)); // Different session should be tracked
        assertTrue(service.shouldTrackVisit("session123", 2L)); // Same session, different customer should be tracked
    }

    @Test
    void testNullSafetyForCounts() {
        // Arrange
        Customer customerWithNullCounts = new Customer();
        customerWithNullCounts.setId(2L);
        customerWithNullCounts.setVisitCount(null);
        customerWithNullCounts.setPurchaseCount(null);

        // Act & Assert
        assertEquals(0L, customerWithNullCounts.getVisitCount());
        assertEquals(0L, customerWithNullCounts.getPurchaseCount());

        customerWithNullCounts.setVisitCount(5L);
        customerWithNullCounts.setPurchaseCount(3L);

        assertEquals(5L, customerWithNullCounts.getVisitCount());
        assertEquals(3L, customerWithNullCounts.getPurchaseCount());
    }
}
