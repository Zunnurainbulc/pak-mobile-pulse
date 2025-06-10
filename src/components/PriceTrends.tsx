
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';

const PriceTrends = () => {
  const { data: priceData, isLoading } = useQuery({
    queryKey: ['price-trends'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mobile_prices')
        .select(`
          price,
          created_at,
          retailer,
          city,
          mobiles(model, mobile_brands(name))
        `)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: avgPrices } = useQuery({
    queryKey: ['avg-prices-by-brand'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mobile_prices')
        .select(`
          price,
          mobiles(mobile_brands(name))
        `);
      
      if (error) throw error;
      
      // Calculate average prices by brand
      const brandPrices: { [key: string]: number[] } = {};
      data.forEach(item => {
        const brandName = item.mobiles?.mobile_brands?.name;
        if (brandName) {
          if (!brandPrices[brandName]) {
            brandPrices[brandName] = [];
          }
          brandPrices[brandName].push(item.price);
        }
      });

      return Object.entries(brandPrices).map(([brand, prices]) => ({
        brand,
        avgPrice: prices.reduce((sum, price) => sum + price, 0) / prices.length,
        count: prices.length
      })).sort((a, b) => b.avgPrice - a.avgPrice);
    },
  });

  // Sample trend data for demonstration
  const trendData = [
    { month: 'Jan', samsung: 85000, apple: 180000, xiaomi: 45000 },
    { month: 'Feb', samsung: 82000, apple: 175000, xiaomi: 43000 },
    { month: 'Mar', samsung: 89000, apple: 190000, xiaomi: 47000 },
    { month: 'Apr', samsung: 87000, apple: 185000, xiaomi: 46000 },
    { month: 'May', samsung: 84000, apple: 182000, xiaomi: 44000 },
    { month: 'Jun', samsung: 86000, apple: 188000, xiaomi: 45000 },
  ];

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-300 rounded"></div>
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
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Price Trends</h1>
        <p className="text-gray-600">Track mobile price movements across Pakistan</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mr-4">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Price</p>
              <p className="text-2xl font-bold text-gray-900">PKR 95,000</p>
              <p className="text-sm text-green-600 flex items-center">
                <TrendingDown className="h-3 w-3 mr-1" />
                -2.3% from last month
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mr-4">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Price Increase</p>
              <p className="text-2xl font-bold text-gray-900">15</p>
              <p className="text-sm text-gray-500">models this week</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mr-4">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Price Decrease</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
              <p className="text-sm text-gray-500">models this week</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mr-4">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Most Volatile</p>
              <p className="text-xl font-bold text-gray-900">iPhone 15</p>
              <p className="text-sm text-gray-500">±5% variation</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Price Trends by Brand (6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${value/1000}K`} />
                <Tooltip formatter={(value) => formatPrice(Number(value))} />
                <Line type="monotone" dataKey="samsung" stroke="#1f77b4" name="Samsung" strokeWidth={2} />
                <Line type="monotone" dataKey="apple" stroke="#ff7f0e" name="Apple" strokeWidth={2} />
                <Line type="monotone" dataKey="xiaomi" stroke="#2ca02c" name="Xiaomi" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Price by Brand</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={avgPrices?.slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="brand" />
                <YAxis tickFormatter={(value) => `${value/1000}K`} />
                <Tooltip formatter={(value) => formatPrice(Number(value))} />
                <Bar dataKey="avgPrice" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Price Changes */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Price Changes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { model: 'Samsung Galaxy S24 Ultra', oldPrice: 449999, newPrice: 439999, change: -2.2, retailer: 'Daraz' },
              { model: 'iPhone 15 Pro', oldPrice: 365000, newPrice: 369999, change: 1.4, retailer: 'PriceOye' },
              { model: 'Xiaomi 14', oldPrice: 89999, newPrice: 85999, change: -4.4, retailer: 'Whatmobile' },
              { model: 'OnePlus 12', oldPrice: 189999, newPrice: 194999, change: 2.6, retailer: 'Daraz' },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{item.model}</h4>
                  <p className="text-sm text-gray-600">Available at {item.retailer}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 line-through">{formatPrice(item.oldPrice)}</span>
                    <span className="font-bold text-gray-900">{formatPrice(item.newPrice)}</span>
                  </div>
                  <div className={`flex items-center text-sm ${item.change > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {item.change > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                    {Math.abs(item.change)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PriceTrends;
