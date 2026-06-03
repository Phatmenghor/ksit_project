import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Palette } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ThemeSetting() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Dashboard Section */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Home className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-medium">Dashboard</h3>
            </div>

            {/* Logo Section */}
            <div className="mb-6">
              <h4 className="mb-4 text-sm font-medium">Logo</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Logo</TableHead>
                    <TableHead>System name</TableHead>
                    <TableHead className="w-[100px] text-right">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <div className="h-16 w-16 overflow-hidden rounded-full bg-[#006241]">
                        <img
                          src="/placeholder.svg?height=64&width=64"
                          alt="Logo"
                          className="h-full w-full"
                        />
                      </div>
                    </TableCell>
                    <TableCell>Institute Management System</TableCell>
                    <TableCell className="text-right">
                      <Button variant="secondary" size="sm">
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* Theme Color Section */}
            <div>
              <h4 className="mb-4 text-sm font-medium flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Theme color
              </h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">
                      Header and Footer
                    </TableHead>
                    <TableHead>Sidebar</TableHead>
                    <TableHead className="w-[100px] text-right">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-20 rounded bg-[#034d3e]"></div>
                        <span className="text-sm">#034d3e</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-20 rounded bg-[#323232]"></div>
                        <span className="text-sm">#323232</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="secondary" size="sm">
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
