
import React from 'react';
import Layout from "../components/Layout";

const AboutUs = () => {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-eco-charcoal mb-8">About Us</h1>
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl font-semibold text-eco-green mb-4">Our Mission</h2>
            <p className="text-gray-600 mb-6">
              At EcoCart, we're committed to making sustainable shopping accessible to everyone. 
              We believe that every small choice towards eco-friendly products makes a big impact 
              on our planet's future.
            </p>
            <h2 className="text-2xl font-semibold text-eco-green mb-4">Our Values</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
              <li>Sustainability in every decision</li>
              <li>Transparency in our operations</li>
              <li>Quality products that last</li>
              <li>Community-driven initiatives</li>
            </ul>
          </div>
          <div className="relative h-96">
            <img
              src="/placeholder.svg"
              alt="About EcoCart"
              className="w-full h-full object-cover rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AboutUs;
