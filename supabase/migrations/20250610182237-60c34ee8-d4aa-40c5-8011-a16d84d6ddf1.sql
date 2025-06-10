
-- Create mobile brands table
CREATE TABLE public.mobile_brands (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mobiles table
CREATE TABLE public.mobiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID REFERENCES public.mobile_brands(id) NOT NULL,
  model TEXT NOT NULL,
  display_size TEXT,
  ram TEXT,
  storage TEXT,
  camera TEXT,
  battery TEXT,
  processor TEXT,
  operating_system TEXT,
  image_url TEXT,
  launch_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mobile prices table for tracking price history
CREATE TABLE public.mobile_prices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mobile_id UUID REFERENCES public.mobiles(id) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  retailer TEXT NOT NULL,
  city TEXT,
  is_current BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  city TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mobile_id UUID REFERENCES public.mobiles(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  pros TEXT[],
  cons TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.mobile_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mobiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mobile_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public read access to mobile data
CREATE POLICY "Anyone can view mobile brands" ON public.mobile_brands FOR SELECT USING (true);
CREATE POLICY "Anyone can view mobiles" ON public.mobiles FOR SELECT USING (true);
CREATE POLICY "Anyone can view mobile prices" ON public.mobile_prices FOR SELECT USING (true);
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for reviews
CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reviews" ON public.reviews FOR DELETE USING (auth.uid() = user_id);

-- Insert sample mobile brands
INSERT INTO public.mobile_brands (name) VALUES 
('Samsung'), ('Apple'), ('Xiaomi'), ('Oppo'), ('Vivo'), ('OnePlus'), ('Realme'), ('Infinix'), ('Tecno'), ('Huawei');

-- Insert sample mobiles with Pakistani market data
INSERT INTO public.mobiles (brand_id, model, display_size, ram, storage, camera, battery, processor, operating_system, launch_date) 
SELECT 
  b.id,
  unnest(ARRAY['Galaxy S24 Ultra', 'Galaxy A55', 'Galaxy A35']) as model,
  unnest(ARRAY['6.8"', '6.6"', '6.6"']) as display_size,
  unnest(ARRAY['12GB', '8GB', '8GB']) as ram,
  unnest(ARRAY['256GB', '128GB', '128GB']) as storage,
  unnest(ARRAY['200MP', '50MP', '50MP']) as camera,
  unnest(ARRAY['5000mAh', '5000mAh', '5000mAh']) as battery,
  unnest(ARRAY['Snapdragon 8 Gen 3', 'Exynos 1480', 'Exynos 1380']) as processor,
  unnest(ARRAY['Android 14', 'Android 14', 'Android 14']) as operating_system,
  unnest(ARRAY['2024-01-17', '2024-03-11', '2024-03-11']::date[]) as launch_date
FROM public.mobile_brands b WHERE b.name = 'Samsung';

-- Insert sample prices for Pakistani market
INSERT INTO public.mobile_prices (mobile_id, price, retailer, city)
SELECT 
  m.id,
  unnest(ARRAY[449999, 89999, 74999]) as price,
  unnest(ARRAY['Daraz', 'PriceOye', 'Whatmobile']) as retailer,
  unnest(ARRAY['Karachi', 'Lahore', 'Islamabad']) as city
FROM public.mobiles m 
JOIN public.mobile_brands b ON m.brand_id = b.id 
WHERE b.name = 'Samsung';
