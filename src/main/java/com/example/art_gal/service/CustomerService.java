package com.example.art_gal.service;

import com.example.art_gal.dto.CustomerDTO;
import com.example.art_gal.dto.ExportOrderDTO;
import com.example.art_gal.entity.Customer;
import com.example.art_gal.entity.ExportOrder;
import com.example.art_gal.exception.ResourceNotFoundException;
import com.example.art_gal.repository.CustomerRepository;
import com.example.art_gal.repository.ExportOrderRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private ExportOrderRepository exportOrderRepository;
    @Autowired
    private ExportOrderService exportOrderService;

    

    public CustomerDTO createCustomer(CustomerDTO customerDTO) {
        Customer customer = convertToEntity(customerDTO);
        Customer savedCustomer = customerRepository.save(customer);
        return convertToDTO(savedCustomer);
    }

    public List<CustomerDTO> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public CustomerDTO getCustomerById(Long id) {
        Customer customer = findCustomerById(id);
        return convertToDTO(customer);
    }

    public CustomerDTO updateCustomer(Long id, CustomerDTO customerDTO) {
        Customer customer = findCustomerById(id);
        
        customer.setName(customerDTO.getName());
        customer.setPhone(customerDTO.getPhone());
        customer.setAddress(customerDTO.getAddress());
        customer.setEmail(customerDTO.getEmail());
        customer.setStatus(customerDTO.isStatus());
        
        Customer updatedCustomer = customerRepository.save(customer);
        return convertToDTO(updatedCustomer);
    }

    public void deleteCustomer(Long id) {
        Customer customer = findCustomerById(id);
        customerRepository.delete(customer);
    }

    private Customer findCustomerById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
    }


    public List<ExportOrderDTO> getCustomerOrders(Long customerId) {
        findCustomerById(customerId); // Kiểm tra xem khách hàng có tồn tại không
        List<ExportOrder> orders = exportOrderRepository.findByCustomerId(customerId);
        return orders.stream()
                     .map(exportOrderService::convertToDTO) // Dùng lại hàm convert có sẵn
                     .collect(Collectors.toList());
                     
    }
    private CustomerDTO convertToDTO(Customer customer) {
        CustomerDTO dto = new CustomerDTO();
        dto.setId(customer.getId());
        dto.setName(customer.getName());
        dto.setPhone(customer.getPhone());
        dto.setAddress(customer.getAddress());
        dto.setEmail(customer.getEmail());
        dto.setStatus(customer.isStatus());
        return dto;
    }

    private Customer convertToEntity(CustomerDTO dto) {
        Customer customer = new Customer();
        customer.setName(dto.getName());
        customer.setPhone(dto.getPhone());
        customer.setAddress(dto.getAddress());
        customer.setEmail(dto.getEmail());
        customer.setStatus(dto.isStatus());
        return customer;
    }
}