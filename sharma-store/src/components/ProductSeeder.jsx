import { useState } from 'react';
import { writeBatch, collection, doc, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { Trash2, UploadCloud, AlertTriangle } from 'lucide-react';

const dummyProducts = [
    // Stationery
    {
        name: "Classmate Pulse 6-Subject Notebook",
        category: "stationery",
        price: 320,
        stock: 50,
        image: "https://images.unsplash.com/photo-1544816155-12df9643f363?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "High quality spiral bound notebook for students."
    },
    {
        name: "Parker Vector Gold Trim Ball Pen",
        category: "stationery",
        price: 499,
        stock: 25,
        image: "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Elegant Parker pen with gold trim, perfect for professionals."
    },
    {
        name: "Premium Geometry Box Set",
        category: "stationery",
        price: 250,
        stock: 40,
        image: "https://images.unsplash.com/photo-1622014169623-288f34d16e92?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Complete geometry set with compass, divider, and rulers."
    },
    {
        name: "Professional Art Kit (50 pcs)",
        category: "stationery",
        price: 1200,
        stock: 10,
        image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Comprehensive art kit including colored pencils, pastels, and paints."
    },
    {
        name: "Sticky Notes Bundle",
        category: "stationery",
        price: 150,
        stock: 100,
        image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Colorful sticky notes for reminders and bookmarks."
    },

    // Toys
    {
        name: "High-Speed Remote Control Car",
        category: "toys",
        price: 1499,
        stock: 15,
        image: "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Rechargeable RC car with high-speed motor and durable tires."
    },
    {
        name: "Classic Barbie Doll",
        category: "toys",
        price: 799,
        stock: 30,
        image: "https://images.unsplash.com/photo-1558877114-1e0954b9d36e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Original Barbie doll with fashionable outfit and accessories."
    },
    {
        name: "Speed Cube 3x3",
        category: "toys",
        price: 299,
        stock: 60,
        image: "https://images.unsplash.com/photo-1594916940027-31950e300ac1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Smooth turning 3x3 Rubik's cube for speedcubing."
    },
    {
        name: "Cricket Bat (Full Size)",
        category: "toys",
        price: 1800,
        stock: 20,
        image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Kashmir Willow cricket bat suitable for tennis ball cricket."
    },
    {
        name: "Building Blocks Set",
        category: "toys",
        price: 650,
        stock: 45,
        image: "https://images.unsplash.com/photo-1587654780291-39c940483713?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Creative building blocks set for kids to unleash imagination."
    },

    // Jewelry
    {
        name: "Artificial Gold Necklace Set",
        category: "jewelry",
        price: 1500,
        stock: 12,
        image: "https://images.unsplash.com/photo-1599643478518-17488fbbcd75?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Traditional gold-plated necklace set with matching earrings."
    },
    {
        name: "Silver Oxidized Jhumka Earrings",
        category: "jewelry",
        price: 350,
        stock: 80,
        image: "https://images.unsplash.com/photo-1635767798638-3e252a0058b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Stylish silver oxidized jhumkas for ethnic wear."
    },
    {
        name: "Designer Bangles Set",
        category: "jewelry",
        price: 450,
        stock: 50,
        image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Set of beautiful designer bangles with stone work."
    },
    {
        name: "Crystal Pendant Chain",
        category: "jewelry",
        price: 599,
        stock: 35,
        image: "https://images.unsplash.com/photo-1515562141207-7a88fb052576?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Minimalist crystal pendant suitable for daily wear."
    },
    {
        name: "Boho Chic Bracelet",
        category: "jewelry",
        price: 299,
        stock: 65,
        image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Trendy boho style bracelet for casual outfits."
    },

    // Birthday
    {
        name: "Happy Birthday Foil Balloon Set",
        category: "birthday",
        price: 499,
        stock: 40,
        image: "https://images.unsplash.com/photo-1558636508-e0db3814bd1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Gold and Black theme happy birthday foil balloons."
    },
    {
        name: "LED Tea Light Candles (Pack of 12)",
        category: "birthday",
        price: 250,
        stock: 100,
        image: "https://images.unsplash.com/photo-1606830501869-7ee4290fb4f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Flameless LED candles for safe and beautiful decoration."
    },
    {
        name: "Party Poppers (Pack of 4)",
        category: "birthday",
        price: 200,
        stock: 60,
        image: "https://images.unsplash.com/photo-1514525253440-b39345208668?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Confetti party poppers to add fun to celebrations."
    },
    {
        name: "Acrylic Cake Topper",
        category: "birthday",
        price: 150,
        stock: 85,
        image: "https://images.unsplash.com/photo-1565576135835-26553835694a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Elegant 'Happy Birthday' acrylic cake topper."
    },
    {
        name: "Decorative Bunting Banner",
        category: "birthday",
        price: 199,
        stock: 70,
        image: "https://images.unsplash.com/photo-1530103862676-de3c9a59af57?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Colorful bunting banner for room decoration."
    }
];

const ProductSeeder = () => {
    const [loading, setLoading] = useState(false);
    const [action, setAction] = useState('');

    const handleClear = async () => {
        if (!confirm("BURNNN! Are you sure you want to DELETE ALL products? This cannot be undone.")) return;

        setLoading(true);
        setAction('Deleting...');
        try {
            const batch = writeBatch(db);
            const snapshot = await getDocs(collection(db, "products"));

            if (snapshot.empty) {
                alert("No products to delete.");
                setLoading(false);
                return;
            }

            snapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });

            await batch.commit();
            alert("All products deleted successfully.");
        } catch (error) {
            console.error("Error clearing products:", error);
            alert("Error deleting products. See console.");
        } finally {
            setLoading(false);
            setAction('');
        }
    }

    const handleSeed = async () => {
        if (!confirm("Are you ready to add 20 corrected products?")) return;

        setLoading(true);
        setAction('Seeding...');

        try {
            const batch = writeBatch(db);

            dummyProducts.forEach((product) => {
                const docRef = doc(collection(db, "products"));
                batch.set(docRef, {
                    ...product,
                    createdAt: new Date().toISOString()
                });
            });

            await batch.commit();
            alert("Success! 20 Corrected Products Added.");
        } catch (error) {
            console.error("Error seeding products:", error);
            alert("Error adding products. Check console for details.");
        } finally {
            setLoading(false);
            setAction('');
        }
    };

    return (
        <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg my-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
                <h3 className="text-orange-800 font-bold flex items-center gap-2">
                    <AlertTriangle size={18} />
                    Developer Tools
                </h3>
                <p className="text-xs text-orange-600 mt-1">
                    Manage your dummy inventory.
                </p>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={handleClear}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                    <Trash2 size={16} />
                    {action === 'Deleting...' ? 'Deleting...' : 'Clear All'}
                </button>

                <button
                    onClick={handleSeed}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                    <UploadCloud size={16} />
                    {action === 'Seeding...' ? 'Uploading...' : 'Seed Data'}
                </button>
            </div>
        </div>
    );
};

export default ProductSeeder;
