export default function RefundPolicy() {
  return (
    <main className="min-h-screen pt-32 pb-24 px-6 bg-white">
      <div className="max-w-4xl mx-auto prose prose-slate prose-lg">
        <h1 className="text-5xl font-black uppercase tracking-tighter italic mb-12">Refund Policy</h1>
        <p className="text-gray-400 font-bold mb-10">Last Updated: April 11, 2026</p>
        
        <div className="space-y-8 text-slate-600 leading-relaxed font-medium">
          <p>We have a 30-day return policy, which means you have 30 days after receiving your item to request a return.</p>
          
          <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900 mt-12">Eligibility for Returns</h2>
          <p>To be eligible for a return, your item must be in the same condition that you received it, unworn or unused, with tags, and in its original packaging. You’ll also need the receipt or proof of purchase.</p>
          
          <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900 mt-12 text-red-600 underline underline-offset-8 decoration-red-100 decoration-4">Non-returnable items</h2>
          <p className="bg-red-50 p-6 rounded-[2rem] border border-red-100 text-red-900 font-bold">Certain types of items cannot be returned, like perishable goods, custom products, and <span className="underline decoration-red-300">personal care goods (such as hygiene-related items like the PureSwipe wand and refills if opened)</span>. Please get in touch if you have questions or concerns about your specific item.</p>
          
          <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900 mt-12">Damages and issues</h2>
          <p>Please inspect your order upon reception and contact us immediately if the item is defective, damaged or if you receive the wrong item, so that we can evaluate the issue and make it right.</p>
          
          <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900 mt-12">Exchanges</h2>
          <p>The fastest way to ensure you get what you want is to return the item you have, and once the return is accepted, make a separate purchase for the new item.</p>
          
          <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900 mt-12">Refunds</h2>
          <p>We will notify you once we’ve received and inspected your return, and let you know if the refund was approved or not. If approved, you’ll be automatically refunded on your original payment method. Please remember it can take some time for your bank or credit card company to process and post the refund too.</p>
        </div>
      </div>
    </main>
  )
}
