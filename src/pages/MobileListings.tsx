
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Star, TrendingUp } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Mobile {
  id: string;
  model: string;
  display_size: string;
  ram: string;
  storage: string;
  camera: string;
  battery: string;
  processor: string;
  operating_system: string;
  image_url: string;
  mobile_brands: { name: string };
  mobile_prices: Array<{
    price: number;
    retailer: string;
    city: string;
  }>;
}

const MobileListings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [priceRange, setPriceRange] = useState('all');

  const { data: mobiles, isLoading } = useQuery({
    queryKey: ['mobiles', searchTerm, selectedBrand, priceRange],
    queryFn: async () => {
      let query = supabase
        .from('mobiles')
        .select(`
          *,
          mobile_brands(name),
          mobile_prices(price, retailer, city)
        `);

      if (searchTerm) {
        query = query.or(`model.ilike.%${searchTerm}%,mobile_brands.name.ilike.%${searchTerm}%`);
      }

      if (selectedBrand !== 'all') {
        query = query.eq('mobile_brands.name', selectedBrand);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Mobile[];
    },
  });

  const { data: brands } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mobile_brands')
        .select('name')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const getLowestPrice = (prices: Mobile['mobile_prices']) => {
    if (!prices?.length) return null;
    return Math.min(...prices.map(p => p.price));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-gray-300 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-300 rounded"></div>
                  <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Mobile Prices in Pakistan</h1>
        <p className="text-gray-600">Compare prices from top retailers across Pakistan</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search mobiles..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={selectedBrand} onValueChange={setSelectedBrand}>
            <SelectTrigger>
              <SelectValue placeholder="Select Brand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Brands</SelectItem>
              {brands?.map((brand) => (
                <SelectItem key={brand.name} value={brand.name}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger>
              <SelectValue placeholder="Price Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="0-50000">Under PKR 50,000</SelectItem>
              <SelectItem value="50000-100000">PKR 50,000 - 100,000</SelectItem>
              <SelectItem value="100000-200000">PKR 100,000 - 200,000</SelectItem>
              <SelectItem value="200000+">Above PKR 200,000</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Mobile Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mobiles?.map((mobile) => {
          const lowestPrice = getLowestPrice(mobile.mobile_prices);
          
          return (
            <Card key={mobile.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{mobile.mobile_brands?.name} {mobile.model}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600 ml-1">4.2 (124 reviews)</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Trending
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="aspect-video bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                  {mobile.image_url ? (
                    <img 
                      src={mobile.image_url} 
                      alt={mobile.model}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-gray-400 text-center">
                      <div className="text-2xl mb-2">📱</div>
                      <div className="text-sm">No Image</div>
                    </div>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-500">Display:</span> {mobile.display_size}</div>
                    <div><span className="text-gray-500">RAM:</span> {mobile.ram}</div>
                    <div><span className="text-gray-500">Storage:</span> {mobile.storage}</div>
                    <div><span className="text-gray-500">Camera:</span> {mobile.camera}</div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  {lowestPrice ? (
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {formatPrice(lowestPrice)}
                      </div>
                      <div className="text-sm text-gray-500">
                        from {mobile.mobile_prices?.length} retailers
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500">Price not available</div>
                  )}
                  
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" className="flex-1">
                      Compare Prices
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {mobiles?.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📱</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No mobiles found</h3>
          <p className="text-gray-600">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
};

export default MobileListings;
