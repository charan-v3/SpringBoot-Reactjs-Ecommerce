package com.cart.ecom_proj.service;

import com.cart.ecom_proj.dto.ProductListResponse;
import com.cart.ecom_proj.model.Product;
import com.cart.ecom_proj.repo.ProductRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepo repo;

    @Autowired
    private FileStorageService fileStorageService;


    public List<Product> getAllProducts() {
        return repo.findAll();
    }

    public List<ProductListResponse> getAllProductsOptimized() {
        List<Product> products = repo.findAll();
        return products.stream()
                .map(ProductListResponse::new)
                .toList();
    }

    public Product getProductById(Long id){
        return repo.findById(id).orElse(null);
    }

    public Product addProduct(Product product, MultipartFile imageFile) throws IOException {
        // Store file locally and get the filename
        String storedFilename = fileStorageService.storeFile(imageFile);

        product.setImageName(imageFile.getOriginalFilename());
        product.setImageType(imageFile.getContentType());
        product.setImagePath(storedFilename);
        // Don't store image bytes in database since we're using file storage
        product.setImageDate(null);
        return repo.save(product);
    }

    public Product updateProduct(Long id, Product product, MultipartFile imageFile) throws IOException {
        // Get existing product to delete old image if needed
        Product existingProduct = repo.findById(id).orElse(null);

        if (imageFile != null && !imageFile.isEmpty()) {
            // Delete old image file if exists
            if (existingProduct != null && existingProduct.getImagePath() != null) {
                fileStorageService.deleteFile(existingProduct.getImagePath());
            }

            // Store new file
            String storedFilename = fileStorageService.storeFile(imageFile);
            product.setImageName(imageFile.getOriginalFilename());
            product.setImageType(imageFile.getContentType());
            product.setImagePath(storedFilename);
            product.setImageDate(null); // Don't store in database
        } else if (existingProduct != null) {
            // Keep existing image data if no new image provided
            product.setImageName(existingProduct.getImageName());
            product.setImageType(existingProduct.getImageType());
            product.setImagePath(existingProduct.getImagePath());
            product.setImageDate(existingProduct.getImageDate());
        }

        product.setId(id);
        return repo.save(product);
    }

    public void deleteProduct(Long id) {
        // Delete associated image file before deleting product
        Product product = repo.findById(id).orElse(null);
        if (product != null && product.getImagePath() != null) {
            try {
                fileStorageService.deleteFile(product.getImagePath());
            } catch (IOException e) {
                // Log error but continue with product deletion
                System.err.println("Failed to delete image file: " + e.getMessage());
            }
        }
        repo.deleteById(id);
    }

    public List<Product> searchProducts(String keyword) {
        return repo.searchProducts(keyword);
    }

    public byte[] getProductImage(Long productId) throws IOException {
        Product product = repo.findById(productId).orElse(null);
        if (product != null && product.getImagePath() != null) {
            return fileStorageService.loadFileAsBytes(product.getImagePath());
        }
        return null; // Only use file storage, no database fallback
    }
}
