import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const pidParam = searchParams.get('pid');
  const inputParam = searchParams.get('input');

  let targetId = pidParam || inputParam;

  if (!targetId) {
    return NextResponse.json({ error: 'Product ID, SKU, or URL is required' }, { status: 400 });
  }

  const apiKey = process.env.CJ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'CJ_API_KEY is not configured in .env.local' }, { status: 500 });
  }

  try {
    // 1. Get Access Token using the API Key
    const authResponse = await fetch('https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey }),
    });

    const authData = await authResponse.json();
    if (!authData.result || !authData.data?.accessToken) {
      throw new Error(authData.message || 'Failed to authenticate with CJ API Key');
    }

    const accessToken = authData.data.accessToken;

    // Determine if targetId is a URL, SKU or PID
    let resolvedPid = targetId;

    // Check if it's a URL
    if (targetId.includes('cjdropshipping.com')) {
      const match = targetId.match(/-p-(\d+)\.html/);
      if (match) {
        resolvedPid = match[1];
      } else {
        throw new Error('Could not extract Product ID from the provided URL');
      }
    }
    // Check if it's a SKU (usually starts with CJ or contains letters and numbers)
    else if (targetId.toUpperCase().startsWith('CJ') || /[A-Za-z]/.test(targetId)) {
      // Use listV2 to search by SKU
      const searchRes = await fetch(`https://developers.cjdropshipping.com/api2.0/v1/product/listV2?page=1&size=10&keyWord=${encodeURIComponent(targetId)}`, {
        method: 'GET',
        headers: {
          'CJ-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      });
      const searchData = await searchRes.json();

      if (!searchData.result || !searchData.data?.content || searchData.data.content.length === 0) {
        throw new Error(`Product not found for SKU: ${targetId}`);
      }

      // Extract the first product ID from the search results
      const firstResult = searchData.data.content[0];
      if (firstResult && firstResult.productList && firstResult.productList.length > 0) {
        resolvedPid = firstResult.productList[0].id;
      } else {
        throw new Error(`No products matched SKU: ${targetId}`);
      }
    }

    // 2. Fetch Product Details using the Access Token
    const response = await fetch(`https://developers.cjdropshipping.com/api2.0/v1/product/query?pid=${resolvedPid}`, {
      method: 'GET',
      headers: {
        'CJ-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!data.result || !data.data) {
      // Sometimes CJ API returns data wrapped differently or an error message in message field
      throw new Error(data.message || 'Product not found or API error');
    }

    const cjProduct = data.data;

    // Map CJ Product structure to our internal schema format
    // Defaulting to realistic fields based on common CJ API responses.
    const images = cjProduct.productImageSet || [cjProduct.productImage].filter(Boolean);

    // Map variants
    const cjVariants = cjProduct.variants || [];
    const mappedVariants = cjVariants.map(v => {
      let rawLabel = v.variantKey || v.variantNameEn || v.variantName || 'Default';
      let cleanLabel = rawLabel;

      // Extract the size part (usually after a dash or comma in CJ variant keys)
      if (cleanLabel.includes('-')) {
        cleanLabel = cleanLabel.split('-').pop().trim();
      } else if (cleanLabel.includes(',')) {
        cleanLabel = cleanLabel.split(',').pop().trim();
      }

      return {
        label: cleanLabel || 'Default',
        sku: v.variantSku || '',
        costPrice: Number(v.sellPrice || cjProduct.sellPrice || 0),
        price: 0, // Leave retail price as zero
        stock: 100, // Dropship assumption
        imageUrl: v.variantImage || images[0] || '',
      };
    });

    // If no variants provided, create a default one
    if (mappedVariants.length === 0) {
      mappedVariants.push({
        label: 'Default',
        sku: cjProduct.productSku || pid,
        costPrice: Number(cjProduct.sellPrice || 0),
        price: 0,
        stock: 100,
        imageUrl: images[0] || '',
      });
    }

    // Strip inline styles and scripts, but keep semantic HTML like <b>, <i>, <p>
    const rawDescription = cjProduct.description || '';
    const cleanDescription = rawDescription
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // remove style tags and content
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // remove scripts
      .replace(/<img[^>]*>/gi, '') // strip all img tags
      .replace(/<p>\s*<br\s*\/?>\s*<\/p>/gi, '') // remove empty paragraph tags
      .replace(/<p><b>Product Image(?:s)?\s*:?\s*<\/b><\/p>/gi, '') // remove wrapped Product Image text
      .replace(/<b>Product Image(?:s)?\s*:?\s*<\/b>/gi, '') // remove bare Product Image bold text
      .replace(/Product Image(?:s)?\s*:?/gi, '') // fallback
      .replace(/\s(style|class|id|width|height)="[^"]*"/gi, '') // remove inline styles, classes, ids
      .replace(/&nbsp;/gi, ' ') // replace html entities
      .trim();

    // Prepare our product payload
    const productPayload = {
      name: cjProduct.productNameEn || cjProduct.productName || '',
      description: cleanDescription,
      images: images,
      category: 'other', // Reverted to default 'other' as requested
      source: 'cj',
      supplier: {
        name: 'CJ Dropshipping',
        externalId: resolvedPid,
        productUrl: `https://cjdropshipping.com/product/import-p-${resolvedPid}.html`,
      },
      variants: mappedVariants,
      shippingCost: 0,
    };

    return NextResponse.json({ product: productPayload });
  } catch (error) {
    console.error('CJ API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch product from CJ' }, { status: 500 });
  }
}
