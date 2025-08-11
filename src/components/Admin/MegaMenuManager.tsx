// This component has been removed as requested
// Menu management is now handled directly from the header interface
export default function MegaMenuManager() {
  return (
    <div className="p-8 text-center">
      <h2 className="text-2xl font-bold mb-4">Menu Management Removed</h2>
      <p className="text-muted-foreground">
        Menu management is now handled directly from the header interface.
        Admins can add categories and products directly from the main menu.
      </p>
    </div>
  );
}ry.type === 'category' ? 'default' : 'secondary'}>
                    {category.type}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(category)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(category._id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {getSubcategories(category._id).length > 0 && (
                <div className="ml-6 mt-4 space-y-2">
                  <h4 className="font-medium text-sm text-gray-700">Subcategories:</h4>
                  {getSubcategories(category._id).map(sub => (
                    <div key={sub._id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        {sub.imageUrl && (
                          <img 
                            src={sub.imageUrl} 
                            alt={sub.name}
                            className="w-8 h-8 object-cover rounded"
                          />
                        )}
                        <span className="text-sm">{sub.name}</span>
                        <Badge variant={sub.type === 'category' ? 'default' : 'secondary'} className="text-xs">
                          {sub.type}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(sub)}>
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(sub._id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MegaMenuManager;