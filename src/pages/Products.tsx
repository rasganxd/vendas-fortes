
  const filterProducts = () => {
    return products.filter(product => {
      const nameMatch = product.name.toLowerCase().includes(search.toLowerCase());
      const codeMatch = product.code.toString().includes(search);
      const categoryMatch = selectedCategory ? (selectedCategory === "all" ? true : product.categoryId === selectedCategory) : true;
      return (nameMatch || codeMatch) && categoryMatch;
    });
  };

  const filterPricingProducts = () => {
    return products.filter(product => {
      const nameMatch = product.name.toLowerCase().includes(pricingSearch.toLowerCase());
      const codeMatch = product.code.toString().includes(pricingSearch);
      const categoryMatch = pricingCategory ? (pricingCategory === "todas" ? true : product.categoryId === pricingCategory) : true;
      return (nameMatch || codeMatch) && categoryMatch;
    });
  };
