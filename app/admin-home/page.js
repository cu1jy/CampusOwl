"use client";
import { useState } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import { AlertTriangle, Bell, Shield, Plus, X } from 'lucide-react';

const SecurityArticle = ({ title, description, link, icon: Icon, onDelete }) => (
    <div className="bg-white p-6 rounded-lg shadow-md relative">
        <button
            onClick={onDelete}
            className="absolute top-2 right-2 text-gray-500 hover:text-red-600"
            aria-label="Delete article"
        >
            <X size={20} />
        </button>
        <div className="flex items-center mb-4">
            <Icon className="mr-2 text-blue-600" size={24} />
            <h2 className="text-xl font-semibold text-black">{title}</h2>
        </div>
        <p className="text-gray-600">{description}</p>
        <a href={link} className="text-blue-600 hover:underline mt-2 inline-block">Read more</a>
    </div>
);

const AddArticleForm = ({ onClose, onSubmit }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [link, setLink] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ title, description, link, icon: Shield });
        setTitle('');
        setDescription('');
        setLink('');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-96">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-black">Add New Article</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Article Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full p-2 mb-4 border rounded"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Article Link"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        className='w-full p-2 mb-4 border rounded'
                        required
                    />
                    <textarea
                        placeholder="Article Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-2 mb-4 border rounded h-32"
                        required
                    />
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
};

export default function Home() {
    const [articles, setArticles] = useState([
        {
            title: "New Security Measures Implemented",
            description: "The university has introduced advanced surveillance systems to enhance campus safety.",
            icon: Shield
        },
        {
            title: "Emergency Response Training",
            description: "Students and staff are encouraged to participate in the upcoming emergency response workshops.",
            icon: AlertTriangle
        },
        {
            title: "Campus Alert System Update",
            description: "Our mobile alert system has been upgraded to provide faster notifications during emergencies.",
            icon: Bell
        }
    ]);

    const [showAddForm, setShowAddForm] = useState(false);

    const handleAddArticle = (newArticle) => {
        setArticles([...articles, newArticle]);
    };

    const handleDeleteArticle = (indexToDelete) => {
        setArticles(articles.filter((_, index) => index !== indexToDelete));
    };

    return (
        <main className="min-h-screen bg-gray-100">
            <AdminNavbar />
            <div className="container mx-auto py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="font-semibold text-black text-3xl">Articles</h1>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-full flex items-center hover:bg-blue-700"
                    >
                        <Plus size={20} className="mr-2" /> Add Article
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    {articles.map((article, index) => (
                        <SecurityArticle
                            key={index}
                            {...article}
                            onDelete={() => handleDeleteArticle(index)}
                        />
                    ))}
                </div>
            </div>
            {showAddForm && (
                <AddArticleForm
                    onClose={() => setShowAddForm(false)}
                    onSubmit={handleAddArticle}
                />
            )}
        </main>
    );
}
