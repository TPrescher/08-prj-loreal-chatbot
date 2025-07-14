export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json",
    };

    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    // --- PRODUCTS ENDPOINT ---
    if (url.pathname === "/products") {
      const products = [
        {
          id: "true-match-foundation",
          name: "True Match Super-Blendable Foundation",
          img: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop&crop=center",
          url: "https://www.lorealparisusa.com/makeup/face/foundation-makeup/true-match-super-blendable-makeup",
        },
        {
          id: "revitalift-serum",
          name: "RevitaLift Derm Intensives 1.5% Pure Hyaluronic Acid Serum",
          img: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop&crop=center",
          url: "https://www.lorealparisusa.com/skin-care/face-serums/revitalift-derm-intensives-pure-hyaluronic-acid-serum",
        },
        {
          id: "lumi-glotion",
          name: "True Match Lumi Glotion Natural Glow Essence",
          img: "https://thekit.ca/wp-content/uploads/2017/07/loreal-shoppers-drug-mart-wedding-makeup-thekit.ca-feature-1.jpg",
          url: "https://www.lorealparisusa.com/makeup/face/highlighter/lumi-glotion-natural-glow-essence",
        },
        {
          id: "lash-paradise",
          name: "Voluminous Lash Paradise Washable Mascara",
          img: "https://thekit.ca/wp-content/uploads/2017/07/loreal-shoppers-drug-mart-wedding-makeup-thekit.ca-feature-1.jpg",
          url: "https://www.lorealparisusa.com/makeup/eye/mascara/voluminous-lash-paradise-washable-mascara",
        },
        {
          id: "infallible-setting-spray",
          name: "Infallible 3-Second Setting Spray",
          img: "https://thekit.ca/wp-content/uploads/2017/07/loreal-shoppers-drug-mart-wedding-makeup-thekit.ca-feature-1.jpg",
          url: "https://www.lorealparisusa.com/makeup/face/setting-spray/infallible-3-second-primer-setting-spray",
        },
        {
          id: "vitamin-c-serum",
          name: "RevitaLift Clinical 12% Pure Vitamin C Serum",
          img: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop&crop=center",
          url: "https://www.lorealparisusa.com/skin-care/face-serums/revitalift-clinical-pure-vitamin-c-serum",
        },
        {
          id: "full-wear-concealer",
          name: "Infallible Full Wear Concealer",
          img: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop&crop=center",
          url: "https://www.lorealparisusa.com/products/makeup/face/concealer/infallible-full-wear-concealer",
        },
        {
          id: "revitalift-moisturizer",
          name: "RevitaLift Triple Power Anti-Aging Moisturizer",
          img: "https://theindustry.beauty/wp-content/uploads/2021/11/Loreal-Paris-Our-Best-Anti-Aging-Products-For-2021-D-e1636038826350.jpeg",
          url: "https://www.lorealparisusa.com/skin-care/moisturizers/revitalift-triple-power-anti-aging-moisturizer",
        },
        {
          id: "retinol-serum",
          name: "RevitaLift Derm Intensives 0.3% Pure Retinol Serum",
          img: "https://theindustry.beauty/wp-content/uploads/2021/11/Loreal-Paris-Our-Best-Anti-Aging-Products-For-2021-D-e1636038826350.jpeg",
          url: "https://www.lorealparisusa.com/skin-care/face-serums/revitalift-derm-intensives-pure-retinol-serum",
        },
        {
          id: "age-perfect-rosy",
          name: "Age Perfect Rosy Tone Moisturizer",
          img: "https://theindustry.beauty/wp-content/uploads/2021/11/Loreal-Paris-Our-Best-Anti-Aging-Products-For-2021-D-e1636038826350.jpeg",
          url: "https://www.lorealparisusa.com/skin-care/moisturizers/age-perfect-rosy-tone-anti-aging-moisturizer-for-mature-skin",
        },
        {
          id: "eye-treatment",
          name: "RevitaLift Triple Power Eye Treatment",
          img: "https://theindustry.beauty/wp-content/uploads/2021/11/Loreal-Paris-Our-Best-Anti-Aging-Products-For-2021-D-e1636038826350.jpeg",
          url: "https://www.lorealparisusa.com/skin-care/eye-care/revitalift-triple-power-anti-aging-eye-treatment",
        },
        {
          id: "everpure-shampoo",
          name: "EverPure Sulfate-Free Moisture Shampoo",
          img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqq5mb_xfglZvUO14SghdzTU3pCE8gWeVVBQ&s",
          url: "https://www.lorealparisusa.com/products/hair-care/products/shampoo/everpure-sulfate-free-moisture-shampoo",
        },
        {
          id: "total-repair-shampoo",
          name: "Elvive Total Repair 5 Repairing Shampoo",
          img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqq5mb_xfglZvUO14SghdzTU3pCE8gWeVVBQ&s",
          url: "https://www.lorealparisusa.com/products/hair-care/products/shampoo/elvive-total-repair-5-repairing-shampoo.aspx",
        },
        {
          id: "dream-lengths-shampoo",
          name: "Elvive Dream Lengths Shampoo",
          img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqq5mb_xfglZvUO14SghdzTU3pCE8gWeVVBQ&s",
          url: "https://www.lorealparisusa.com/products/hair-care/products/shampoo/elvive-dream-lengths-shampoo.aspx",
        },
        {
          id: "infinite-black-liner",
          name: "Infallible Infinite Black Liner",
          img: "https://thekit.ca/wp-content/uploads/2017/07/loreal-shoppers-drug-mart-wedding-makeup-thekit.ca-feature-1.jpg",
          url: "https://www.lorealparisusa.com/makeup/eye/liner/infallible-infinite-black-liner",
        },
        {
          id: "pro-glow-foundation",
          name: "Infallible Pro-Glow Foundation",
          img: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop&crop=center",
          url: "https://www.lorealparisusa.com/makeup/face/foundation/infallible-pro-glow-foundation",
        },
        {
          id: "pro-matte-foundation",
          name: "Infallible Pro-Matte Foundation",
          img: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop&crop=center",
          url: "https://www.lorealparisusa.com/makeup/face/foundation/infallible-pro-matte-foundation",
        },
        {
          id: "colorista-spray",
          name: "Colorista Fade-Defy Shampoo-In Color",
          img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqq5mb_xfglZvUO14SghdzTU3pCE8gWeVVBQ&s",
          url: "https://www.lorealparisusa.com/hair-care/color-treatment/colorista-fade-defy-shampoo-in-color",
        },
      ];
      return new Response(JSON.stringify(products), { headers: corsHeaders });
    }

    // --- CHAT ENDPOINT (default) ---
    if (request.method === "POST") {
      const apiKey = env.OPENAI_API_KEY;
      const apiUrl = "https://api.openai.com/v1/chat/completions";
      const userInput = await request.json();

      const requestBody = {
        model: "gpt-4o",
        messages: userInput.messages,
        max_tokens: 300,
      };

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      return new Response(JSON.stringify(data), { headers: corsHeaders });
    }

    // --- DEFAULT: Not found ---
    return new Response("Not found", { status: 404, headers: corsHeaders });
  },
};
